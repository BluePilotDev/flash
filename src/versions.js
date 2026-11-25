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
 * Entries with `bluepilot` are BluePilot releases (listed first). Entries with only `openpilot` are stock comma
 * releases (the AGNOS pinned by that tagged openpilot release), offered for other forks; their manifests come from
 * the release tag's commit. Keep each group newest first. Exactly one entry has `default: true`.
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

  // Other stable AGNOS versions: the AGNOS pinned by comma's tagged openpilot releases (commaai/openpilot tags).
  // Not tied to a BluePilot release and not tested by us. comma four listed only from AGNOS 16 (as bp-6.0).
  { id: 'agnos-18.3', agnos: '18.3', openpilot: 'openpilot 0.11.1', devices: ['tizi', 'mici'] },
  { id: 'agnos-17.2', agnos: '17.2', openpilot: 'openpilot 0.11.0', devices: ['tizi', 'mici'] },
  { id: 'agnos-15.1', agnos: '15.1', openpilot: 'openpilot 0.10.2', devices: ['tizi'] },
  { id: 'agnos-14.3', agnos: '14.3', openpilot: 'openpilot 0.10.1', devices: ['tizi'] },
  { id: 'agnos-12.8', agnos: '12.8', openpilot: 'openpilot 0.10.0', devices: ['tici', 'tizi'] },
  { id: 'agnos-12.3', agnos: '12.3', openpilot: 'openpilot 0.9.9', devices: ['tici', 'tizi'] },
  { id: 'agnos-11.11', agnos: '11.11', openpilot: 'openpilot 0.9.8', devices: ['tici', 'tizi'] },
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

/** Subtitle shown next to the dropdown entry, e.g. "BluePilot 7.1" */
export function versionSubtitle(version) {
  return version.bluepilot ?? version.openpilot
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
