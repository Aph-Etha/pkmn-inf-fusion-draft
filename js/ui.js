const UI={

    initialize(){

        const count=document.getElementById("playerCount");

        count.value = Game.playerCount || count.value;

        count.addEventListener("change",()=>{

            this.generatePlayerInputs(
                Number(count.value),
                Game.players
            );

        });

        this.generatePlayerInputs(
            Number(count.value),
            Game.players
        );

        document
            .getElementById("beginGame")
            .addEventListener("click",()=>{

                Draft.begin();

            });

    },

    generatePlayerInputs(count, existingPlayers = []){

        const container=document.getElementById(
            "playerInputs"
        );

        container.innerHTML="";

        for(let i=0;i<count;i++){

            const input=document.createElement("input");

            input.type="text";

            const existing = existingPlayers[i];

            input.value = existing?.name || `Player ${i+1}`;
            input.placeholder=`Player ${i+1}`;

            input.maxLength=20;

            container.appendChild(input);

        }

    },

    collectPlayers(){

        const inputs=[
            ...document.querySelectorAll(
                "#playerInputs input"
            )
        ];

        Game.players=[];

        inputs.forEach((input,index)=>{

            Game.players.push({

                id:index,

                name:
                    input.value.trim() ||
                    `Player ${index+1}`,

                team:[],

                fusions:[]

            });

        });

    },

    updateStatus(text){

        const status=document.getElementById(
            "wheelStatus"
        );

        if(status){

            status.textContent=text;

        }

    },

    lockButtons(){

        document
            .querySelectorAll("button")
            .forEach(button=>{

                button.disabled=true;

            });

    },

    unlockButtons(){

        document
            .querySelectorAll("button")
            .forEach(button=>{

                button.disabled=false;

            });

    }

};

window.UI=UI;

Object.assign(UI, {

    clearPokemonChoices(){

        const container =
            document.getElementById(
                "pokemonChoices"
            );

        container.innerHTML = "";

    },

    showMessage(message){

        const info =
            document.getElementById(
                "roundInfo"
            );

        info.innerHTML = `
            <h2>${message}</h2>
        `;

    },

    highlightCurrentPlayer(){

        document
            .querySelectorAll(".playerCard")
            .forEach(card=>{

                card.classList.remove("active");

            });

        const cards =
            document.querySelectorAll(
                ".playerCard"
            );

        if(cards[Game.currentPlayerIndex]){

            cards[
                Game.currentPlayerIndex
            ].classList.add("active");

        }

    },

    rebuild(){

        Renderer.renderPlayers();

        Renderer.renderOrder();

        Renderer.renderRound();

        Renderer.renderChoices();

    },

    reset(){

        Renderer.showSetup();

        this.generatePlayerInputs(
            Game.playerCount,
            Game.players
        );

    }

});

window.UI = UI;