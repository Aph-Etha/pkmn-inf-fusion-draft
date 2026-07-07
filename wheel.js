const Wheel={

    canvas:null,

    ctx:null,

    rotation:0,

    spinning:false,

    segments:[],

    currentWinner:null,

    initialize(){

        this.canvas=document.getElementById(
            "wheel"
        );

        this.ctx=this.canvas.getContext("2d");

        this.rotation=0;

        this.spinning=false;

        this.currentWinner=null;

        this.buildSegments();

        this.draw();

        document
            .getElementById("spinButton")
            .onclick=()=>{

                this.start();

            };

        UI.updateStatus(
            "Spin to determine who chooses draft position first."
        );

    },

    buildSegments(){

        this.segments=[];

        Game.players.forEach(player=>{

            this.segments.push({

                id:player.id,

                label:player.name,

                eliminated:false

            });

        });

    },

    draw(){

        const ctx=this.ctx;

        const canvas=this.canvas;

        const radius=canvas.width/2;

        ctx.clearRect(

            0,

            0,

            canvas.width,

            canvas.height

        );

        const angle=

            (Math.PI*2)/

            this.segments.length;

        ctx.save();

        ctx.translate(

            radius,

            radius

        );

        ctx.rotate(this.rotation);

        this.segments.forEach(

            (segment,index)=>{

                ctx.globalAlpha = segment.eliminated ? 0.35 : 1;

                ctx.beginPath();

                ctx.moveTo(0,0);

                ctx.arc(

                    0,

                    0,

                    radius-10,

                    angle*index,

                    angle*(index+1)

                );

                ctx.closePath();

                ctx.fillStyle=

                    index%2

                    ? "#d32f2f"

                    : "#ffcc00";

                ctx.fill();

                ctx.strokeStyle="#111";

                ctx.lineWidth=3;

                ctx.stroke();

                ctx.save();

                ctx.rotate(

                    angle*index+

                    angle/2

                );

                ctx.textAlign="right";

                ctx.fillStyle=

                    index%2

                    ? "white"

                    : "black";

                ctx.font="bold 22px sans-serif";

                ctx.fillText(

                    segment.label,

                    radius-45,

                    8

                );

                ctx.restore();

            }

        );

        ctx.restore();

    },

    start(){

        if(this.spinning){

            return;

        }

        this.spinning = true;

        document
            .getElementById("spinButton")
            .disabled = true;

        const available = this.segments.filter(s=>!s.eliminated);

        const winner = Random.choice(available);

        this.currentWinner = winner;

        const winnerIndex = this.segments.findIndex(s=>s.id===winner.id);

        const slice = (Math.PI*2)/this.segments.length;
        const pointerAngle = -Math.PI/2;
        const segmentCenterAngle = (winnerIndex*slice)+(slice/2);

        const target =
            (Math.PI*2*8) +
            (pointerAngle - segmentCenterAngle);

        const startRotation = this.rotation;
        const duration = 5000;
        const start = performance.now();

        const animate = (time)=>{

            let t = (time-start)/duration;

            if(t>1)t=1;

            const eased =
                1-Math.pow(1-t,4);

            this.rotation =
                startRotation +
                (target-startRotation)*eased;

            this.draw();

            if(t<1){

                requestAnimationFrame(animate);

            }

            else{

                this.finishSpin();

            }

        };

        requestAnimationFrame(animate);

    },

    finishSpin(){

        this.spinning=false;

        this.rotation =
            this.rotation %
            (Math.PI*2);

        this.draw();

        const winner =
            this.currentWinner;

        winner.eliminated=true;
        this.draw();

        Game.wheelOrder.push(
            winner.id
        );

        Game.wheelSpinsCompleted++;

        UI.updateStatus(

            `${Helpers.playerByID(
                winner.id
            ).name} chooses a draft position.`

        );

        this.presentDraftChoices(
            winner.id
        );

    },

    presentDraftChoices(playerID){

        let panel =
            document.getElementById(
                "orderChoice"
            );

        if(!panel){

            panel =
                document.createElement("div");

            panel.id="orderChoice";

            document
                .getElementById(
                    "wheelScreen"
                )
                .appendChild(panel);

        }

        panel.style.display="block";

        panel.innerHTML=`

            <h3>

                ${
                    Helpers.playerByID(
                        playerID
                    ).name
                }

                select your draft position

            </h3>

            <div class="orderButtons">

            </div>

        `;

        const buttons =
            panel.querySelector(
                ".orderButtons"
            );

        Game.availableOrderChoices.forEach(pos=>{

            const button =
                document.createElement("button");

            button.textContent=pos;

            button.onclick=()=>{

                this.chooseDraftPosition(
                    playerID,
                    pos
                );

            };

            buttons.appendChild(button);

        });

    },

    chooseDraftPosition(playerID, position){

        Game.draftOrder[position - 1] = playerID;

        Game.availableOrderChoices =
            Game.availableOrderChoices.filter(
                p => p !== position
            );

        const panel =
            document.getElementById("orderChoice");

        if(panel){

            panel.style.display = "none";

        }

        if(
            Game.wheelSpinsCompleted <
            Game.playerCount
        ){

            document
                .getElementById("spinButton")
                .disabled = false;

            UI.updateStatus(
                "Spin for the next player."
            );

            return;

        }

        const assigned = new Set(Game.draftOrder.filter(Boolean));
        const remainingPlayers = Game.players
            .map(p => p.id)
            .filter(id => !assigned.has(id));

        for(let i = 0; i < Game.draftOrder.length; i++){
            if(Game.draftOrder[i] === undefined){
                Game.draftOrder[i] = remainingPlayers.shift();
            }
        }

        UI.updateStatus(
            "Draft order finalized!"
        );

        setTimeout(()=>{

            Draft.startDraft();

        },1000);



    }

    

};



window.Wheel = Wheel;