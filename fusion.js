const Fusion={

    generate(){

        Renderer.showFusion();

        Game.players.forEach(player=>{

            this.generatePlayerFusions(

                player,

                "random"

            );

        });

        this.render();

        Storage.save();

    },

    render(){

        const container=
            document.getElementById(
                "fusionTeams"
            );

        container.innerHTML="";

        Game.players.forEach(player=>{

            const panel=
                document.createElement("div");

            panel.className=
                "fusionPlayer fusionReveal";

            panel.innerHTML=`

                <div class="fusionHeader">

                    <h3>

                        ${player.name}

                    </h3>

                    <span>

                        6 Fusions

                    </span>

                </div>

                <div class="fusionGrid">

                </div>

            `;

            const grid=
                panel.querySelector(
                    ".fusionGrid"
                );

            const exportBox = document.createElement("div");
            exportBox.className = "teamExports";
            exportBox.innerHTML = `
                <div class="teamExportGroup">
                    <label>Showdown</label>
                    <textarea readonly>${this.buildShowdownTeam(player)}</textarea>
                </div>
                <div class="teamExportGroup">
                    <label>Pokeathlon</label>
                    <textarea readonly>${this.buildPokeathlonTeam(player)}</textarea>
                </div>
            `;
            panel.appendChild(exportBox);

            player.fusions.forEach(fusion=>{

                const card=
                    document.createElement("div");

                card.className=
                    "fusionCard";

                card.innerHTML=`

                    <div class="fusionSprite">

                        <div class="fusionSpritePair">

                            <img class="fusionSpriteHead" src="${fusion.head.sprite || Assets.pokemonSprite(fusion.head)}" onerror="this.src='assets/pokemon/0.png'">

                            <img class="fusionSpriteBody" src="${fusion.body.sprite || Assets.pokemonSprite(fusion.body)}" onerror="this.src='assets/pokemon/0.png'">

                            <div class="fusionSpriteDivider"></div>

                        </div>

                    </div>

                    <div class="fusionInfo">

                        <div class="fusionName">

                            ${fusion.name}

                        </div>

                        <div class="fusionParents">

                            ${fusion.head.name}

                            +

                            ${fusion.body.name}

                        </div>

                    </div>

                `;

                grid.appendChild(card);

            });

            container.appendChild(panel);

        });

    },
    exportJSON(){

        const exportData={

            created:new Date().toISOString(),

            players:Game.players.map(player=>{

                return{

                    name:player.name,

                    team:player.team,

                    fusions:player.fusions

                };

            })

        };

        const blob=new Blob(

            [

                JSON.stringify(
                    exportData,
                    null,
                    4
                )

            ],

            {

                type:"application/json"

            }

        );

        const url=

            URL.createObjectURL(blob);

        const a=

            document.createElement("a");

        a.href=url;

        a.download="fusionDraft.json";

        a.click();

        URL.revokeObjectURL(url);

    },

    restart(){

        if(

            !confirm(

                "Start a new draft?"

            )

        ){

            return;

        }

        App.newGame();

        UI.reset();

    },

    buildRandomPairs(team){

        const pool = [...team];

        Utils.shuffle(pool);

        const pairs = [];

        while(pool.length >= 2){

            pairs.push({

                head: pool.shift(),

                body: pool.shift()

            });

        }

        return pairs;

    },

    buildHighestBSTPairs(team){

        const pool = [...team].sort(

            (a,b)=>

                (b.bst||0) -

                (a.bst||0)

        );

        const pairs=[];

        while(pool.length>=2){

            pairs.push({

                head:pool.shift(),

                body:pool.pop()

            });

        }

        return pairs;

    },

    buildAdjacentPairs(team){

        const pool=[...team];

        const pairs=[];

        for(

            let i=0;

            i<pool.length;

            i+=2

        ){

            if(pool[i+1]){

                pairs.push({

                    head:pool[i],

                    body:pool[i+1]

                });

            }

        }

        return pairs;

    },

    generatePlayerFusions(

        player,

        strategy="random"

    ){

        let pairs=[];

        switch(strategy){

            case "adjacent":

                pairs=this.buildAdjacentPairs(

                    player.team

                );

                break;

            case "bst":

                pairs=this.buildHighestBSTPairs(

                    player.team

                );

                break;

            default:

                pairs=this.buildRandomPairs(

                    player.team

                );

        }

        player.fusions=[];

        pairs.forEach(pair=>{

            player.fusions.push({

                head:pair.head,

                body:pair.body,

                sprite:

                    Assets.fusionSprite(

                        pair.head,

                        pair.body

                    ),

                backupSprite:

                    Assets.fusionSpriteReverse(

                        pair.head,

                        pair.body

                    ),

                name:

                    `${pair.head.name}/${pair.body.name}`

            });

        });

    },
    // js/fusion.js
// ADD INSIDE Fusion

    buildShowdownTeam(player){

        return (player.team || [])
            .map(mon => mon.name)
            .join("\n");

    },

    buildPokeathlonTeam(player){

        return (player.team || [])
            .map(mon => `${mon.name} | ${mon.types ? mon.types.join("/") : "?"}`)
            .join("\n");

    },

    async verifyFusionSprites(){

        for(

            const player of Game.players

        ){

            for(

                const fusion of player.fusions

            ){

                const exists=

                    await Utils.fileExists(

                        fusion.sprite

                    );

                if(exists){

                    continue;

                }

                const reverse=

                    await Utils.fileExists(

                        fusion.backupSprite

                    );

                if(reverse){

                    fusion.sprite=

                        fusion.backupSprite;

                }

                else{

                    fusion.sprite=

                        Assets.pokemonSprite(

                            fusion.head

                        );

                }

            }

        }

    },

};

window.Fusion=Fusion;

