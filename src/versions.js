/**
 * Hand-edited list of AGNOS versions offered by the BluePilot flasher.
 *
 * Each entry maps a BluePilot release (bp-x.y) to the AGNOS build that release was made for.
 * Manifests live in public/manifests/<id>/ (all-partitions.json + agnos.json, merged by getManifest()).
 * Image archives are still downloaded from comma's CDN (see the URLs inside the manifests).
 *
 * devices: which comma hardware this AGNOS can be flashed to. Names match getDeviceType():
 *   32 = tici (comma 3), 33 = tizi (comma 3X), 34 = mici (comma four)
 *
 * Source of truth for the device lists: https://bluepilot.dev/2025/07/13/bluepilot-version-history/
 *   bp-5.0 dropped the comma 3, bp-6.0 added the comma four.
 *
 * Keep newest first. Exactly one entry has `default: true`.
 */

export const DEVICE_TYPE_IDS = { 32: 'tici', 33: 'tizi', 34: 'mici' }

// Which picker choice (comma three/3X vs comma four) each hardware belongs to
export const DEVICE_FAMILY = { tici: 'comma3', tizi: 'comma3', mici: 'comma4' }

export const VERSIONS = [
  { id: 'bp-7.1', agnos: '19.9', bluepilot: 'BluePilot 7.1', devices: ['tizi', 'mici'], default: true },
  { id: 'bp-7.0', agnos: '18.5', bluepilot: 'BluePilot 7.0', devices: ['tizi', 'mici'] },
  { id: 'bp-6.0', agnos: '16', bluepilot: 'BluePilot 6.0', devices: ['tizi', 'mici'] },
  { id: 'bp-5.0', agnos: '13.1', bluepilot: 'BluePilot 5.0', devices: ['tizi'] },
  { id: 'bp-4.0', agnos: '12.4', bluepilot: 'BluePilot 4.0', devices: ['tici', 'tizi'] },
  { id: 'bp-3.1', agnos: '12.1', bluepilot: 'BluePilot 3.1', devices: ['tici', 'tizi'] },
  { id: 'bp-3.0', agnos: '11.13', bluepilot: 'BluePilot 3.0', devices: ['tici', 'tizi'] },
  // No all-partitions.json existed for AGNOS 11.4. public/manifests/bp-2.1 pairs the AGNOS 11.7 partition table
  // (identical GPT) with the 11.4 boot/system/bootloader images from agnos.json. Tested on a comma 3 (2026-11-24).
  { id: 'bp-2.1', agnos: '11.4', bluepilot: 'BluePilot 2.1', devices: ['tici', 'tizi'] },
]

export const DEFAULT_VERSION_ID = VERSIONS.find((v) => v.default).id

/** @param {string} id */
export function getVersion(id) {
  return VERSIONS.find((v) => v.id === id) ?? null
}

/**
 * Versions that can run on the chosen picker family ('comma3' or 'comma4').
 * @param {string} family
 */
export function versionsForFamily(family) {
  return VERSIONS.filter((v) => v.devices.some((d) => DEVICE_FAMILY[d] === family))
}

/** Dropdown text, e.g. "AGNOS 19.9 (recommended)" */
export function versionLabel(version) {
  return `AGNOS ${version.agnos}${version.default ? ' (recommended)' : ''}`
}

/** Subtitle shown under the dropdown entry, e.g. "BluePilot 7.1" */
export function versionSubtitle(version) {
  return version.bluepilot
}

/**
 * Manifest URL for a version on the connected hardware, or null if that version doesn't support it.
 * @param {string} versionId
 * @param {number} deviceTypeId value from getDeviceType() (32/33/34)
 * @param {string} [base] base URL manifests are served from
 */
export function resolveManifestUrl(versionId, deviceTypeId, base = document.baseURI) {
  const version = getVersion(versionId)
  const device = DEVICE_TYPE_IDS[Number(deviceTypeId)]
  if (!version || !device || !version.devices.includes(device)) return null
  return new URL(`manifests/${version.id}/all-partitions.json`, base).href
}
