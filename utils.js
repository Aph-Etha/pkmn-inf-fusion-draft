const Utils={

    shuffle(array){

        for(

            let i=array.length-1;

            i>0;

            i--

        ){

            const j=Math.floor(

                Math.random()*

                (i+1)

            );

            [

                array[i],

                array[j]

            ]=[

                array[j],

                array[i]

            ];

        }

        return array;

    },

    random(max){

        return Math.floor(

            Math.random()*max

        );

    },

    randomRange(min,max){

        return Math.floor(

            Math.random()*

            (max-min+1)

        )+min;

    },

    clone(obj){

        return JSON.parse(

            JSON.stringify(obj)

        );

    },

    capitalize(str){

        return str.charAt(0)

            .toUpperCase()

            +

            str.slice(1);

    },

    remove(array,item){

        const index=

            array.indexOf(item);

        if(index>-1){

            array.splice(index,1);

        }

    }

};

window.Utils=Utils;

Utils.fileExists = async function(url){

    try{

        const response = await fetch(

            url,

            {

                method:"HEAD"

            }

        );

        return response.ok;

    }

    catch{

        return false;

    }

};

Utils.weightedShuffle=function(array,weightFn){

    const copy=[...array];

    copy.sort(

        ()=>Math.random()-0.5

    );

    copy.sort(

        (a,b)=>

            weightFn(b)-weightFn(a)

    );

    return copy;

};