/**
 * Property data loader — property1.json is the single source of truth.
 * Converts project JSON into MapLibre-ready GeoJSON FeatureCollections.
 * Renders only real geometry; empty geometry arrays are skipped (never invented).
 */

const STATUS_COLORS = {
  available: '#22c55e',
  reserved: '#f59e0b',
  sold: '#ef4444'
};

function statusColor(status) {
  const key = String(status || '').toLowerCase();
  return STATUS_COLORS[key] || '#39D98A';
}

function isLngLat(pt) {
  return (
    Array.isArray(pt) &&
    pt.length >= 2 &&
    Number.isFinite(Number(pt[0])) &&
    Number.isFinite(Number(pt[1]))
  );
}

function asRing(coords) {
  if (!Array.isArray(coords) || coords.length < 3) return null;
  if (!isLngLat(coords[0])) return null;
  const ring = coords.map((pt) => [Number(pt[0]), Number(pt[1])]);
  const first = ring[0];
  const last = ring[ring.length - 1];
  if (first[0] !== last[0] || first[1] !== last[1]) ring.push([...first]);
  return ring.length >= 4 ? ring : null;
}

/**
 * Normalize property1.json geometry values into a GeoJSON geometry, or null.
 * Accepts: GeoJSON geometry object, exterior ring [[lng,lat],...], or Polygon rings.
 */
export function normalizeGeometry(raw) {
  if (!raw) return null;

  if (raw.type && raw.coordinates) {
    if (raw.type === 'Polygon' || raw.type === 'MultiPolygon' || raw.type === 'LineString' || raw.type === 'MultiLineString' || raw.type === 'Point') {
      return raw;
    }
  }

  if (!Array.isArray(raw) || raw.length === 0) return null;

  // LineString: [[lng,lat], ...] with no nested rings intent when used for roads
  if (isLngLat(raw[0])) {
    const ring = asRing(raw);
    if (ring) return { type: 'Polygon', coordinates: [ring] };
    if (raw.length >= 2) {
      return {
        type: 'LineString',
        coordinates: raw.map((pt) => [Number(pt[0]), Number(pt[1])])
      };
    }
    return null;
  }

  // Polygon rings: [ ring, hole, ... ]
  if (Array.isArray(raw[0]) && isLngLat(raw[0][0])) {
    const rings = raw.map(asRing).filter(Boolean);
    if (!rings.length) return null;
    return { type: 'Polygon', coordinates: rings };
  }

  // MultiPolygon-ish: [ [ rings... ], ... ]
  if (Array.isArray(raw[0]) && Array.isArray(raw[0][0]) && isLngLat(raw[0][0][0])) {
    const polys = [];
    raw.forEach((poly) => {
      const rings = poly.map(asRing).filter(Boolean);
      if (rings.length) polys.push(rings);
    });
    if (!polys.length) return null;
    return { type: 'MultiPolygon', coordinates: polys };
  }

  return null;
}

function ringCentroid(ring) {
  if (!ring || ring.length < 3) return null;
  let area = 0;
  let cx = 0;
  let cy = 0;
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const xi = ring[i][0];
    const yi = ring[i][1];
    const xj = ring[j][0];
    const yj = ring[j][1];
    const f = xi * yj - xj * yi;
    area += f;
    cx += (xi + xj) * f;
    cy += (yi + yj) * f;
  }
  area *= 0.5;
  if (Math.abs(area) < 1e-12) {
    const n = ring.length - 1;
    let sx = 0;
    let sy = 0;
    for (let i = 0; i < n; i++) {
      sx += ring[i][0];
      sy += ring[i][1];
    }
    return [sx / n, sy / n];
  }
  return [cx / (6 * area), cy / (6 * area)];
}

export function geometryCentroid(geometry) {
  if (!geometry) return null;
  if (geometry.type === 'Point') return geometry.coordinates;
  if (geometry.type === 'LineString') {
    const c = geometry.coordinates;
    const mid = c[Math.floor(c.length / 2)];
    return mid ? [mid[0], mid[1]] : null;
  }
  if (geometry.type === 'Polygon') return ringCentroid(geometry.coordinates[0]);
  if (geometry.type === 'MultiPolygon') return ringCentroid(geometry.coordinates[0]?.[0]);
  return null;
}

export function getProjectCenter(property) {
  const loc = property?.project?.location;
  if (loc && Number.isFinite(loc.longitude) && Number.isFinite(loc.latitude)) {
    return [loc.longitude, loc.latitude];
  }
  return null;
}

/**
 * Build MapLibre FeatureCollections from property1.json.
 */
export function buildPropertyMapData(property) {
  const boundaryFeatures = [];
  const plotFeatures = [];
  const plotLabelFeatures = [];
  const roadFeatures = [];
  const commonFeatures = [];

  const project = property?.project || {};
  const projectName = project.name || 'Property';

  const boundaryGeom = normalizeGeometry(property?.boundary?.geometry);
  if (boundaryGeom && (boundaryGeom.type === 'Polygon' || boundaryGeom.type === 'MultiPolygon')) {
    boundaryFeatures.push({
      type: 'Feature',
      id: 'property-boundary',
      properties: {
        kind: 'property-boundary',
        name: property?.boundary?.name || projectName,
        layer: 'property-boundary'
      },
      geometry: boundaryGeom
    });
  }

  (property?.plots || []).forEach((plot) => {
    const geom = normalizeGeometry(plot.geometry);
    if (!geom || (geom.type !== 'Polygon' && geom.type !== 'MultiPolygon')) return;

    const status = plot.status;
    const color = statusColor(status);
    const props = {
      kind: 'plot',
      number: plot.number,
      area_sqyd: plot.area_sqyd,
      facing: plot.facing,
      status,
      color,
      name: `Plot ${plot.number}`
    };

    plotFeatures.push({
      type: 'Feature',
      id: `plot-${plot.number}`,
      properties: props,
      geometry: geom
    });

    const center = geometryCentroid(geom);
    if (center) {
      plotLabelFeatures.push({
        type: 'Feature',
        id: `plot-label-${plot.number}`,
        properties: {
          kind: 'plot-label',
          number: plot.number,
          label: String(plot.number),
          status,
          color
        },
        geometry: { type: 'Point', coordinates: center }
      });
    }
  });

  (property?.roads || []).forEach((road, index) => {
    const geom = normalizeGeometry(road.geometry);
    if (!geom) return;

    let geometry = geom;
    // Prefer line rendering for roads when given a ring/polygon footprint
    if (geom.type === 'Polygon' && geom.coordinates?.[0]?.length >= 2) {
      geometry = { type: 'LineString', coordinates: geom.coordinates[0] };
    } else if (geom.type !== 'LineString' && geom.type !== 'MultiLineString') {
      return;
    }

    roadFeatures.push({
      type: 'Feature',
      id: `road-${index}`,
      properties: {
        kind: 'road',
        width_ft: road.width_ft,
        type: road.type,
        name: road.width_ft ? `${road.width_ft} ft road` : `Road ${index + 1}`
      },
      geometry
    });
  });

  (property?.common_areas || []).forEach((area, index) => {
    const geom = normalizeGeometry(area.geometry);
    if (!geom || (geom.type !== 'Polygon' && geom.type !== 'MultiPolygon')) return;

    const name = area.name || `Common ${index + 1}`;
    const lower = name.toLowerCase();
    let subtype = 'open-area';
    if (lower.includes('social')) subtype = 'social-infrastructure';
    else if (lower.includes('utility')) subtype = 'utility';

    commonFeatures.push({
      type: 'Feature',
      id: `common-${index}`,
      properties: {
        kind: 'common-area',
        subtype,
        name,
        area_sqyd: area.area_sqyd
      },
      geometry: geom
    });
  });

  return {
    project,
    center: getProjectCenter(property),
    featuresList: property?.features || [],
    boundary: { type: 'FeatureCollection', features: boundaryFeatures },
    plots: { type: 'FeatureCollection', features: plotFeatures },
    plotLabels: { type: 'FeatureCollection', features: plotLabelFeatures },
    roads: { type: 'FeatureCollection', features: roadFeatures },
    commonAreas: { type: 'FeatureCollection', features: commonFeatures },
    raw: property
  };
}

export async function loadPropertyData(url = './property1.json') {
  const res = await fetch(url, { cache: 'no-cache' });
  if (!res.ok) throw new Error(`Failed to load property data (${res.status})`);
  const property = await res.json();
  return buildPropertyMapData(property);
}

export { STATUS_COLORS, statusColor };
