const Game = {

    version: "1.0.0",

    state: "setup",

    playerCount: 4,

    players: [],

    round: 1,

    totalRounds: 12,

    currentPlayerIndex: 0,

    draftOrder: [],

    wheelOrder: [],

    wheelSpinsCompleted: 0,

    availableOrderChoices: [],

    pokemonPool: [],

    currentChoices: [],

    history: [],

    settings: {

        pokemonPerRound: 0,

        picksPerPlayer: 12,

        fusionTeamSize: 6,

        rotateDraftEachRound: true,

        randomSeed: null,

        fusionStrategy:"random",

        allowDuplicateFusions:false,

        randomizeHeadBody:true,

        showFusionParents:true,

        draftMode: "standard",
        poolGeneration: "random",       // random | bst | evolution | typeBalanced
        preventLegendaries: false,
        preventMythicals: false,
        preventParadox: false,
        preventUltraBeasts: false,
        preventDuplicates: true,
        allowRegionalForms: true,
        allowMegas: false,
        allowGigantamax: false,
        allowCustomPokemon: false,

    },

    initialized: false,


    usedPokemon: new Set(),

    fusionSpriteRoot:
    "assets/fusions/",

    pokemonSpriteRoot:
    "assets/pokemon/",

    spriteExtension:
    ".png",

};

window.addEventListener("load", async () => {

    await App.initialize();

});

const App = {

    async initialize(){

        Storage.load();

        UI.initialize();

        await this.loadPokemonDatabase();

        Game.initialized = true;

    },

    async loadPokemonDatabase(){

        try{

            await Data.load();

            Game.pokemonPool =
                Utils.clone(
                    Data.pokemon
                );

        }

        catch(e){

            console.error(e);

            alert(
                "Unable to load pokemon.json"
            );

        }

    },

    newGame(){

        Game.state = "setup";

        Game.round = 1;

        Game.currentPlayerIndex = 0;

        Game.players = [];

        Game.draftOrder = [];

        Game.wheelOrder = [];

        Game.history = [];

        Game.currentChoices = [];

        Game.wheelSpinsCompleted = 0;

        Game.availableOrderChoices = [];
        Game.usedPokemon = new Set();

    }

};

const Renderer = {

    renderPlayers(){

        const container = document.getElementById("players");

        container.innerHTML = "";

        const currentPlayerId = Game.draftOrder[Game.currentPlayerIndex];

        Game.players.forEach((player)=>{

            const card = document.createElement("div");

            card.className="playerCard";

            if(player.id === currentPlayerId){

                card.classList.add("active");

            }

            const header=document.createElement("div");

            header.className="playerHeader";

            const initials = player.name.split(/\s+/).slice(0,2).map(chunk => chunk[0] || '').join('').toUpperCase();

            header.innerHTML=`

                <div class="playerMeta">
                    <div class="playerAvatar">${initials || 'P'}</div>
                    <div class="playerNameWrap">
                        <h3>${player.name}</h3>
                        <span>Drafting</span>
                    </div>
                </div>

                <div class="pickCounter">

                    ${player.team.length}/12

                </div>

            `;

            const grid=document.createElement("div");

            grid.className="teamGrid";

            for(let i=0;i<12;i++){

                const slot=document.createElement("div");

                slot.className="pokemonSlot";

                if(player.team[i]){

                    slot.classList.add("filled");

                    slot.innerHTML=`

                        <img src="${player.team[i].sprite}">

                        <div class="pokemonName">

                            ${player.team[i].name}

                        </div>

                    `;

                }

                else{

                    slot.innerHTML=`

                        <div class="placeholder">

                            ${i+1}

                        </div>

                    `;

                }

                grid.appendChild(slot);

            }

            card.appendChild(header);

            card.appendChild(grid);

            container.appendChild(card);

        });

    },

    renderOrder(){

        const order=document.getElementById("draftOrder");

        order.innerHTML="";

        Game.draftOrder.forEach((playerID,index)=>{

            const badge=document.createElement("div");

            badge.className="orderBadge";

            if(index===Game.currentPlayerIndex){

                badge.classList.add("current");

            }

            const player=Helpers.playerByID(playerID);

            badge.innerHTML=`

                <span class="position">

                    Pick ${index+1}

                </span>

                <span class="name">

                    ${player.name}

                </span>

            `;

            order.appendChild(badge);

        });

    },

    renderRound(){

        const round=document.getElementById("roundInfo");

        if(!round){

            return;

        }

        const currentPlayer = this.getCurrentPlayer();

        round.innerHTML=`

            <h2>

                Round ${Game.round}

            </h2>

            <p>

                ${currentPlayer ? `${currentPlayer.name}'s Pick` : "Draft setup"}

            </p>

        `;

    },

    

};

const Generator={

    generateChoices(){

        const needed=Game.playerCount;

        const copy=[...Game.pokemonPool];

        Utils.shuffle(copy);

        Game.currentChoices=[];

        for(let i=0;i<needed;i++){

            Game.currentChoices.push(copy[i]);

        }

        Renderer.renderChoices();

    }

};

Renderer.renderChoices=function(){

    const area=document.getElementById("pokemonChoices");

    if(!area){

        return;

    }

    area.innerHTML="";

    Game.currentChoices.forEach((pokemon,index)=>{

        const card=document.createElement("div");

        card.className="pokemonCard fadeIn";

        card.innerHTML=`

            <img src="${Assets.pokemonSprite(pokemon)}" onerror="this.src='assets/pokemon/0.png'">

            <h4>${pokemon.name}</h4>

            <small>#${pokemon.dex}</small>

        `;

        card.onclick=()=>{

            Draft.selectPokemon(index);

        };

        area.appendChild(card);

    });

};

Object.assign(Renderer, {

    getCurrentPlayer(){

        if(!Game.players.length){

            return null;

        }

        const playerId = Game.draftOrder[Game.currentPlayerIndex];

        return Game.players.find(player => player.id === playerId) || Game.players[playerId] || null;

    },

    refresh(){

        this.renderRound();
        this.renderOrder();
        this.renderPlayers();

    },

    showSetup(){

        document
            .getElementById("setup")
            .classList.remove("hidden");

        document
            .getElementById("wheelScreen")
            .classList.add("hidden");

        document
            .getElementById("draftScreen")
            .classList.add("hidden");

        document
            .getElementById("fusionScreen")
            .classList.add("hidden");

    },

    showWheel(){

        document
            .getElementById("setup")
            .classList.add("hidden");

        document
            .getElementById("wheelScreen")
            .classList.remove("hidden");

        document
            .getElementById("draftScreen")
            .classList.add("hidden");

        document
            .getElementById("fusionScreen")
            .classList.add("hidden");

    },

    showDraft(){

        document
            .getElementById("setup")
            .classList.add("hidden");

        document
            .getElementById("wheelScreen")
            .classList.add("hidden");

        document
            .getElementById("draftScreen")
            .classList.remove("hidden");

        document
            .getElementById("fusionScreen")
            .classList.add("hidden");

    },

    showFusion(){

        document
            .getElementById("setup")
            .classList.add("hidden");

        document
            .getElementById("wheelScreen")
            .classList.add("hidden");

        document
            .getElementById("draftScreen")
            .classList.add("hidden");

        document
            .getElementById("fusionScreen")
            .classList.remove("hidden");

    }

});

const Turn = {

    next(){

        Game.currentPlayerIndex++;

        if(Game.currentPlayerIndex >= Game.playerCount){

            this.finishRound();

            return;

        }

        Renderer.refresh();

    },

    finishRound(){

        Game.round++;

        Game.currentPlayerIndex = 0;

        if(Game.round > Game.totalRounds){

            Fusion.generate();

            return;

        }

        if(Game.settings.rotateDraftEachRound){

            Draft.rotateDraftOrder();

        }

        Generator.generateChoices();

        Renderer.refresh();

        Storage.save();

    }

};

const History = {

    add(entry){

        Game.history.push({

            time:new Date().toISOString(),

            ...entry

        });

    }

};

const Validator = {

    teamFull(player){

        return player.team.length >=
            Game.settings.picksPerPlayer;

    },

    draftFinished(){

        return Game.players.every(p=>{

            return this.teamFull(p);

        });

    }

};

const Helpers = {

    player(){

        const playerId = Game.draftOrder[Game.currentPlayerIndex];

        return this.playerByID(playerId);

    },

    playerByID(id){

        return Game.players.find(p=>p.id===id);

    },

    removeChoice(index){

        Game.currentChoices.splice(index,1);

    }

};

window.Game=Game;
window.App=App;
window.Renderer=Renderer;
window.Generator=Generator;
window.Turn=Turn;
window.History=History;
window.Validator=Validator;
window.Helpers=Helpers;

const Random = {

    integer(min,max){

        return Math.floor(
            Math.random()*(max-min+1)
        )+min;

    },

    choice(array){

        return array[
            this.integer(0,array.length-1)
        ];

    },

    sample(array,count){

        const copy=[...array];

        Utils.shuffle(copy);

        return copy.slice(0,count);

    }

};

const Assets={

    sprite(pokemon){

        if(pokemon.sprite){

            return pokemon.sprite;

        }

        return `assets/pokemon/${pokemon.dex}.png`;

    },

    resolveSprite(pokemon){

        if(!pokemon){

            return `${Game.pokemonSpriteRoot}0${Game.spriteExtension}`;

        }

        if(typeof pokemon.sprite === 'string' && pokemon.sprite.trim()){

            return pokemon.sprite;

        }

        const dex = pokemon.dex ?? pokemon.id ?? 0;

        return `${Game.pokemonSpriteRoot}${dex}${Game.spriteExtension}`;

    },

    fusion(head,body){

        return `assets/fusions/${head.dex}.${body.dex}.png`;

    },

    pokemonSprite(pokemon){

        return this.resolveSprite(pokemon);

    },

    fusionSprite(head,body){

        if(!head || !body){

            return `${Game.fusionSpriteRoot}0.0${Game.spriteExtension}`;

        }

        return `${Game.fusionSpriteRoot}${head.dex}.${body.dex}${Game.spriteExtension}`;

    },

    fusionSpriteReverse(head,body){

        if(!head || !body){

            return `${Game.fusionSpriteRoot}0.0${Game.spriteExtension}`;

        }

        return `${Game.fusionSpriteRoot}${body.dex}.${head.dex}${Game.spriteExtension}`;

    }

};

const Events={

    beginDraft(){

        Renderer.showDraft();

        Generator.generateChoices();

        Renderer.refresh();

    },

    save(){

        Storage.save();

    }

};

window.Random=Random;
window.Assets=Assets;
window.Events=Events;