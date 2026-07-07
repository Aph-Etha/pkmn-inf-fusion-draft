const Storage={

    key:"fusionDraftSave",

    save(){

        try{

            const snapshot = {

                ...Game,

                usedPokemon: [...Game.usedPokemon]

            };

            localStorage.setItem(

                this.key,

                JSON.stringify(snapshot)

            );

        }

        catch(e){

            console.error(e);

        }

    },

    load(){

        try{

            const save=

                localStorage.getItem(

                    this.key

                );

            if(!save){

                return false;

            }

            const parsed=

                JSON.parse(save);

            Object.assign(

                Game,

                parsed

            );

            Game.usedPokemon = new Set(parsed.usedPokemon || []);

            return true;

        }

        catch(e){

            console.error(e);

            return false;

        }

    },

    clear(){

        localStorage.removeItem(

            this.key

        );

    }

};

window.Storage=Storage;