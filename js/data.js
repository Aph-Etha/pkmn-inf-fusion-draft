const Data = {

    pokemon: [],

    pokemonMap: new Map(),

    pokemonByDex: new Map(),

    fusionDex: new Map(),

    loaded:false,

    async load(){

        const response = await fetch(
            "data/pokemon.json"
        );

        this.pokemon = await response.json();

        this.pokemon.sort((a,b)=>a.dex-b.dex);

        this.pokemonMap.clear();
        this.pokemonByDex.clear();

        this.pokemon.forEach(p=>{

            p.sprite =
                p.sprite ||
                `assets/pokemon/${p.dex}.png`;

            this.pokemonMap.set(
                p.name.toLowerCase(),
                p
            );

            this.pokemonByDex.set(
                Number(p.dex),
                p
            );

        });

        this.loaded=true;

    },

    getByDex(id){

        return this.pokemonByDex.get(
            Number(id)
        );

    },

    getByName(name){

        return this.pokemonMap.get(
            name.toLowerCase()
        );

    }

};

window.Data = Data;