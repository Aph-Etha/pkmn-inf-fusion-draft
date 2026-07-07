const fs = require('fs');
const path = require('path');

const outputPath = path.join(__dirname, '..', 'data', 'pokemon.json');

async function fetchJson(url) {
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Request failed: ${res.status} ${res.url}`);
  }
  return res.json();
}

async function main() {
  const list = await fetchJson('https://pokeapi.co/api/v2/pokemon?limit=1025');
  const entries = [];

  for (const item of list.results) {
    const details = await fetchJson(item.url);
    const types = details.types.map((entry) => entry.type.name).map((name) => name.charAt(0).toUpperCase() + name.slice(1));
    const stats = details.stats || [];
    const bst = stats.reduce((sum, stat) => sum + (stat.base_stat || 0), 0);

    entries.push({
      dex: details.id,
      name: details.name.split('-').map((part) => part.charAt(0).toUpperCase() + part.slice(1)).join(' '),
      types,
      bst,
      sprite: details.sprites?.other?.['official-artwork']?.front_default || details.sprites?.front_default || null,
      legendary: details.is_legendary || false,
      mythical: details.is_mythical || false,
      ultraBeast: details.name.includes('ultra') || false,
      paradox: false,
      mega: details.name.includes('mega') || false,
      gmax: details.name.includes('gmax') || false,
      forms: details.forms?.map((form) => form.name) || [],
    });
  }

  entries.sort((a, b) => a.dex - b.dex);
  fs.writeFileSync(outputPath, JSON.stringify(entries, null, 2));
  console.log(`Wrote ${entries.length} Pokémon to ${outputPath}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
