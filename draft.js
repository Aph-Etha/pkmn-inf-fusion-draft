const Draft = {

    begin(){

        Game.playerCount = Number(
            document.getElementById("playerCount").value
        );

        UI.collectPlayers();

        Game.round = 1;
        Game.currentPlayerIndex = 0;

        Game.currentChoices = [];
        Game.history = [];

        Game.players.forEach(player=>{

            player.team = [];
            player.fusions = [];

        });

        Game.draftOrder = Array(Game.playerCount).fill(undefined);
        Game.wheelOrder = [];
        Game.wheelSpinsCompleted = 0;

        Game.availableOrderChoices=[];

        for(let i=1;i<=Game.playerCount;i++){

            Game.availableOrderChoices.push(i);

        }

        Game.usedPokemon = new Set();

        Renderer.showWheel();

        Wheel.initialize();

    },

    startDraft(){

        Renderer.showDraft();

        this.beginRound();

    },

    beginRound(){

        Game.currentPlayerIndex = 0;

        this.generateChoices();

        Renderer.refresh();

    },

    generateRoundChoices(){

        Game.currentChoices=[];

        const available = Data.pokemon.filter(p=>{

            return !Game.usedPokemon.has(
                Number(p.dex)
            );

        });

        Utils.shuffle(available);

        for(

            let i=0;

            i<Game.playerCount;

            i++

        ){

            Game.currentChoices.push(

                available[i]

            );

        }

        Renderer.renderChoices();

    },

    selectPokemon(choiceIndex){

        const pokemon=

            Game.currentChoices[
                choiceIndex
            ];

        const player=

            Helpers.player();

        player.team.push(pokemon);

        Game.usedPokemon.add(

            Number(pokemon.dex)

        );

        History.add({

            type:"draft",

            round:Game.round,

            player:player.name,

            pokemon:pokemon.name

        });

        Game.currentChoices.splice(

            choiceIndex,

            1

        );

        Renderer.renderChoices();

        Renderer.renderPlayers();

        Storage.save();

        this.advancePick();

    },

    advancePick(){

        Game.currentPlayerIndex++;

        if(

            Game.currentPlayerIndex >=

            Game.draftOrder.length

        ){

            this.finishRound();

            return;

        }

        while(

            this.currentPlayer() &&
            this.currentPlayer().team.length >= 12

        ){

            Game.currentPlayerIndex++;

            if(

                Game.currentPlayerIndex >=

                Game.draftOrder.length

            ){

                this.finishRound();

                return;

            }

        }

        Renderer.refresh();

    },

    finishRound(){

        if(

            this.everyoneFinished()

        ){

            Fusion.generate();

            return;

        }

        Game.round++;

        Game.currentPlayerIndex=0;

        this.rotateDraftOrder();
        this.beginRound();

    },

    rotateDraftOrder(){

        const first=

            Game.draftOrder.shift();

        Game.draftOrder.push(first);

    },

    everyoneFinished(){

        return Game.players.every(

            player=>

                player.team.length>=12

        );

    },

    currentPlayer(){

        const playerId = Game.draftOrder[Game.currentPlayerIndex];

        return Helpers.playerByID(playerId);

    },
    remainingPokemon(){

        return Data.pokemon.filter(p=>{

            return !Game.usedPokemon.has(
                Number(p.dex)
            );

        });

    },

    removePokemonFromPool(dex){

        Game.usedPokemon.add(
            Number(dex)
        );

    },

    undoLastPick(){

        if(Game.history.length===0){

            return;

        }

        const last=Game.history.pop();

        if(last.type!=="draft"){

            return;

        }

        const player=Game.players.find(

            p=>p.name===last.player

        );

        if(!player){

            return;

        }

        const removed=player.team.pop();

        if(removed){

            Game.usedPokemon.delete(

                Number(removed.dex)

            );

        }

        Renderer.refresh();

        Renderer.renderChoices();

        Storage.save();

    },

    skipToNextRound(){

        this.finishRound();

    },

    buildPlayerSummary(){

        return Game.players.map(player=>{

            return{

                name:player.name,

                drafted:player.team.length,

                remaining:

                    12-player.team.length

            };

        });

    },

    exportDraft(){

        return{

            round:Game.round,

            order:[...Game.draftOrder],

            history:[...Game.history],

            players:Utils.clone(

                Game.players

            )

        };

    },

    importDraft(save){

        Game.round=save.round;

        Game.draftOrder=[

            ...save.order

        ];

        Game.history=[

            ...save.history

        ];

        Game.players=Utils.clone(

            save.players

        );

        Game.usedPokemon=new Set();

        Game.players.forEach(player=>{

            player.team.forEach(mon=>{

                Game.usedPokemon.add(

                    Number(mon.dex)

                );

            });

        });

        Renderer.refresh();

        Renderer.renderChoices();

    },

    buildAvailablePool(){

        return Data.pokemon.filter(p=>{

            if(
                Game.settings.preventDuplicates &&
                Game.usedPokemon.has(Number(p.dex))
            ){
                return false;
            }

            if(
                Game.settings.preventLegendaries &&
                p.legendary
            ){
                return false;
            }

            if(
                Game.settings.preventMythicals &&
                p.mythical
            ){
                return false;
            }

            if(
                Game.settings.preventUltraBeasts &&
                p.ultraBeast
            ){
                return false;
            }

            if(
                Game.settings.preventParadox &&
                p.paradox
            ){
                return false;
            }

            if(
                !Game.settings.allowMegas &&
                p.mega
            ){
                return false;
            }

            if(
                !Game.settings.allowGigantamax &&
                p.gmax
            ){
                return false;
            }

            return true;

        });

    },

    generateBalancedChoices(){

        const pool = this.buildAvailablePool();

        const grouped = {};

        pool.forEach(mon=>{

            const type = mon.types[0];

            if(!grouped[type]){

                grouped[type]=[];

            }

            grouped[type].push(mon);

        });

        Object.values(grouped).forEach(group=>{

            Utils.shuffle(group);

        });

        const types = Object.keys(grouped);

        Utils.shuffle(types);

        Game.currentChoices=[];

        let index=0;

        while(

            Game.currentChoices.length <

            Game.playerCount &&

            types.length

        ){

            const type=

                types[index%types.length];

            if(grouped[type].length){

                Game.currentChoices.push(

                    grouped[type].pop()

                );

            }

            index++;

        }

    },

    generateBSTChoices(){

        const pool=

            this.buildAvailablePool();

        const sorted=

            Utils.weightedShuffle(

                pool,

                p=>p.bst||0

            );

        Game.currentChoices=

            sorted.slice(

                0,

                Game.playerCount

            );

    },

    generateChoices(){

        switch(

            Game.settings.poolGeneration

        ){

            case "bst":

                this.generateBSTChoices();
                break;

            case "typeBalanced":

                this.generateBalancedChoices();
                break;

            default:

                this.generateRoundChoices();

        }

        Renderer.renderChoices();

    },

    

};

Draft.generateRoundChoices = function(){

    const pool = this.buildAvailablePool();

    Utils.shuffle(pool);

    Game.currentChoices = [];

const boardSize = 4;

    for(

        let i = 0;

        i < boardSize;

        i++

    ){

        if(!pool[i]){

            break;

        }

        Game.currentChoices.push(

            pool[i]

        );

    }

};

Draft.selectPokemon = function(choiceIndex){

    const pokemon =

        Game.currentChoices[
            choiceIndex
        ];

    if(!pokemon){

        return;

    }

    const player =

        Helpers.player();

    player.team.push(pokemon);

    Game.usedPokemon.add(

        pokemon.dex

    );

    History.add({

        type:"draft",

        player:player.name,

        pokemon:pokemon.name,

        round:Game.round

    });

    Game.currentChoices.splice(

        choiceIndex,

        1

    );

    Renderer.renderPlayers();

    Renderer.renderChoices();

    Storage.save();

    this.advancePick();

};

Draft.advancePick = function(){

    if(

        Validator.draftFinished()

    ){

        Fusion.generate();

        return;

    }

    Game.currentPlayerIndex++;

    if(

        Game.currentPlayerIndex >=

        Game.draftOrder.length

    ){

        Game.currentPlayerIndex = 0;

    }

    while(

        this.currentPlayer().team.length >= 12

    ){

        Game.currentPlayerIndex++;

        if(

            Game.currentPlayerIndex >=

            Game.draftOrder.length

        ){

            Game.currentPlayerIndex = 0;

        }

    }

    if(

        Game.currentChoices.length === 0

    ){

        this.finishRound();

        return;

    }

    Renderer.refresh();

};

window.Draft=Draft;