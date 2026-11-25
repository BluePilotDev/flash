import { describe, expect, test } from 'vitest'

import { VERSIONS, DEFAULT_VERSION_ID, getVersion, resolveManifestUrl, versionsForFamily } from './versions'

const BASE = 'https://bluepilotdev.github.io/flash/'

describe('versions', () => {
  test('exactly one default and unique ids', () => {
    expect(VERSIONS.filter((v) => v.default)).toHaveLength(1)
    expect(new Set(VERSIONS.map((v) => v.id)).size).toBe(VERSIONS.length)
    expect(getVersion(DEFAULT_VERSION_ID).agnos).toBe('19.9')
  })

  test('resolves manifest for supported device', () => {
    expect(resolveManifestUrl('bp-7.1', 33, BASE)).toBe(`${BASE}manifests/bp-7.1/all-partitions.json`)
    expect(resolveManifestUrl('bp-7.1', 34, BASE)).toBe(`${BASE}manifests/bp-7.1/all-partitions.json`)
    expect(resolveManifestUrl('bp-3.0', 32, BASE)).toBe(`${BASE}manifests/bp-3.0/all-partitions.json`)
  })

  test('accepts the device type as a string (qdl.js may return one)', () => {
    expect(resolveManifestUrl('bp-4.0', '32', BASE)).toBe(`${BASE}manifests/bp-4.0/all-partitions.json`)
  })

  test('returns null instead of falling back when device unsupported', () => {
    expect(resolveManifestUrl('bp-5.0', 32, BASE)).toBeNull() // comma 3 dropped in bp-5.0
    expect(resolveManifestUrl('bp-4.0', 34, BASE)).toBeNull() // no comma four before bp-6.0
    expect(resolveManifestUrl('bp-9.9', 33, BASE)).toBeNull()
    expect(resolveManifestUrl('bp-7.1', 99, BASE)).toBeNull()
  })

  test('picker lists only versions for the chosen family', () => {
    expect(versionsForFamily('comma4').map((v) => v.id)).toEqual(['bp-7.1', 'bp-7.0', 'bp-6.0', 'agnos-18.3', 'agnos-17.2'])
    expect(versionsForFamily('comma3')).toHaveLength(VERSIONS.length)
  })
})
