import programmerUrl from './QDL/programmer.bin?url'

// AGNOS versions and their manifests are defined in ./versions.js
const config = {
  loader: {
    // QDL programmer, bundled with this site (copied from commaai/flash)
    url: programmerUrl,
  },
}

export default config
