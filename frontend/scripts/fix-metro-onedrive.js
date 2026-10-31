const fs = require('fs');
const path = require('path');

/**
 * On Windows systems where project repositories are hosted inside Microsoft OneDrive
 * or synced cloud folders, OneDrive sets FILE_ATTRIBUTE_REPARSE_POINT on files & folders.
 * Node's readdir({ withFileTypes: true }) flags these as symbolic links (entry.isSymbolicLink() = true,
 * and entry.isDirectory() = false for directories!).
 *
 * This causes two issues in Metro file map:
 * 1. Metro treats folders (like expo-asset/build) as non-directories and skips crawling them.
 * 2. Metro attempts to call readlink() on non-symlink files, crashing with EINVAL (-4071).
 *
 * This patch fixes both @expo/metro-file-map and metro-file-map by checking fs.lstatSync
 * on Windows when isSymbolicLink is reported, restoring the proper isDirectory/isSymbolicLink values.
 */
function patchAll() {
  // 1. Patch @expo/metro-file-map
  const expoCrawler = path.resolve(__dirname, '../node_modules/@expo/metro-file-map/build/crawlers/node/index.js');
  const expoIndex = path.resolve(__dirname, '../node_modules/@expo/metro-file-map/build/index.js');

  if (fs.existsSync(expoCrawler)) {
    let content = fs.readFileSync(expoCrawler, 'utf8');
    if (!content.includes('stat.isDirectory()')) {
      const target = 'const isDirectory = entry.isDirectory();';
      const replacement = `let isDirectory = entry.isDirectory();
                    const file = directory + _path().sep + name;
                    let isSymbolicLink = entry.isSymbolicLink();
                    if (isSymbolicLink && process.platform === 'win32') {
                        try {
                            const stat = _fs().lstatSync(file);
                            if (!stat.isSymbolicLink()) {
                                isSymbolicLink = false;
                                isDirectory = stat.isDirectory();
                            }
                        } catch {
                            isSymbolicLink = false;
                        }
                    }`;
      if (content.includes(target)) {
        content = content.replace(target, replacement);
        // Clean up any redundant duplicate declarations if present
        content = content.replace(/const file = directory \+ _path\(\)\.sep \+ name;\s*const isSymbolicLink = entry\.isSymbolicLink\(\);/g, '');
        fs.writeFileSync(expoCrawler, content, 'utf8');
        console.log('✓ Patched @expo/metro-file-map crawler for Windows OneDrive');
      }
    }
  }

  if (fs.existsSync(expoIndex)) {
    let content = fs.readFileSync(expoIndex, 'utf8');
    if (!content.includes("err && (err.code === 'EINVAL' || err.code === 'UNKNOWN')")) {
      const readlinkTarget = `            return _fs().promises.readlink(this.#pathUtils.normalToAbsolute(normalPath)).then((symlinkTarget)=>{
                fileMetadata[_constants.default.VISITED] = 1;
                fileMetadata[_constants.default.SYMLINK] = (0, _normalizePathSeparatorsToPosix.default)(this.#pathUtils.resolveSymlinkToNormal(normalPath, symlinkTarget));
            });`;
      const readlinkReplacement = `            return _fs().promises.readlink(this.#pathUtils.normalToAbsolute(normalPath)).then((symlinkTarget)=>{
                fileMetadata[_constants.default.VISITED] = 1;
                fileMetadata[_constants.default.SYMLINK] = (0, _normalizePathSeparatorsToPosix.default)(this.#pathUtils.resolveSymlinkToNormal(normalPath, symlinkTarget));
            }).catch((err)=>{
                if (err && (err.code === 'EINVAL' || err.code === 'UNKNOWN')) {
                    fileMetadata[_constants.default.SYMLINK] = 0;
                    return;
                }
                throw err;
            });`;
      if (content.includes(readlinkTarget)) {
        content = content.replace(readlinkTarget, readlinkReplacement);
      }
    }
    if (!content.includes("'EINVAL'")) {
      content = content.replace(
        `            if ([
                'ENOENT',
                'EACCESS'
            ].includes(error.code ?? '')) {`,
        `            if ([
                'ENOENT',
                'EACCESS',
                'EINVAL',
                'UNKNOWN'
            ].includes(error.code ?? '')) {`
      );
    }
    fs.writeFileSync(expoIndex, content, 'utf8');
    console.log('✓ Patched @expo/metro-file-map index for Windows OneDrive');
  }

  // 2. Patch metro-file-map
  const metroCrawler = path.resolve(__dirname, '../node_modules/metro-file-map/src/crawlers/node/index.js');
  const metroIndex = path.resolve(__dirname, '../node_modules/metro-file-map/src/index.js');

  if (fs.existsSync(metroCrawler)) {
    let content = fs.readFileSync(metroCrawler, 'utf8');
    if (!content.includes('stat.isDirectory()')) {
      const target = `            if (entry.isSymbolicLink() && !includeSymlinks) {
              return;
            }
            if (entry.isDirectory()) {
              search(file);
              return;
            }`;
      const replacement = `            let isDirectory = entry.isDirectory();
            let isSymbolicLink = entry.isSymbolicLink();
            if (process.platform === 'win32' && isSymbolicLink) {
              try {
                const stat = fs.lstatSync(file);
                if (!stat.isSymbolicLink()) {
                  isSymbolicLink = false;
                  isDirectory = stat.isDirectory();
                }
              } catch {
                isSymbolicLink = false;
              }
            }
            if (isSymbolicLink && !includeSymlinks) {
              return;
            }
            if (isDirectory) {
              search(file);
              return;
            }`;
      if (content.includes(target)) {
        content = content.replace(target, replacement);
        fs.writeFileSync(metroCrawler, content, 'utf8');
        console.log('✓ Patched metro-file-map crawler for Windows OneDrive');
      }
    }
  }

  if (fs.existsSync(metroIndex)) {
    let content = fs.readFileSync(metroIndex, 'utf8');
    if (!content.includes("err && (err.code === 'EINVAL' || err.code === 'UNKNOWN')")) {
      const readlinkTarget = `  #maybeReadLink(normalPath, fileMetadata) {
    if (fileMetadata[_constants.default.SYMLINK] === 1) {
      return _nodeFs.promises
        .readlink(this.#pathUtils.normalToAbsolute(normalPath))
        .then((symlinkTarget) => {
          fileMetadata[_constants.default.VISITED] = 1;
          fileMetadata[_constants.default.SYMLINK] = symlinkTarget;
        });
    }
    return null;
  }`;
      const readlinkReplacement = `  #maybeReadLink(normalPath, fileMetadata) {
    if (fileMetadata[_constants.default.SYMLINK] === 1) {
      return _nodeFs.promises
        .readlink(this.#pathUtils.normalToAbsolute(normalPath))
        .then((symlinkTarget) => {
          fileMetadata[_constants.default.VISITED] = 1;
          fileMetadata[_constants.default.SYMLINK] = symlinkTarget;
        })
        .catch((err) => {
          if (err && (err.code === 'EINVAL' || err.code === 'UNKNOWN')) {
            fileMetadata[_constants.default.SYMLINK] = 0;
            return;
          }
          throw err;
        });
    }
    return null;
  }`;
      if (content.includes(readlinkTarget)) {
        content = content.replace(readlinkTarget, readlinkReplacement);
      }
    }
    if (!content.includes('"EINVAL"')) {
      content = content.replace(
        'if (["ENOENT", "EACCESS"].includes(error.code)) {',
        'if (["ENOENT", "EACCESS", "EINVAL", "UNKNOWN"].includes(error.code)) {'
      );
    }
    fs.writeFileSync(metroIndex, content, 'utf8');
    console.log('✓ Patched metro-file-map index for Windows OneDrive');
  }
}

try {
  patchAll();
} catch (e) {
  // Silent fail if node_modules is not present
}
