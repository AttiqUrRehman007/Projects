const { World,
        Bodies,
        Runner,
        Engine,
        Render,
        Body,
        Events   } = Matter;

const horizontalCells = 15;
const verticalCells = 11;
const width =  window.innerWidth;
const height = window.innerHeight;

const unitLengthX = width / horizontalCells;
const unitLengthY = height / verticalCells;

const engine = Engine.create();
engine.world.gravity.y = 0;
const { world } = engine;
const render = Render.create({
    element: document.body,
    engine: engine,
    options: {
        wireframes: false,
        width,
        height
    }
})

Render.run(render);
Runner.run(Runner.create(), engine)



//Walls
const walls = [
    Bodies.rectangle(width / 2, 0, width, 2, {isStatic: true}),
    Bodies.rectangle(width/2, height, width, 2, {isStatic: true}),
    Bodies.rectangle(0, height/2, 2, height, {isStatic: true}),
    Bodies.rectangle(width, height/2, 2, height, {isStatic:true})

]
World.add(world, walls)

//Maze generation

const shuffle = (arr) => {
    let counter = arr.length;

    while (counter > 0){
        const index = Math.floor(Math.random() * counter);
        counter --

        const temp = arr[counter];
        arr[counter] = arr[index];
        arr[index] = temp;
    }
    return arr;
}

const gird = Array(verticalCells).fill(null).map(() => Array(horizontalCells).fill(false));

const verticals = Array(verticalCells).fill(null).map(() => Array(horizontalCells - 1).fill(false));
const horizontals = Array(verticalCells - 1 ).fill(null).map(() => Array(horizontalCells).fill(false));

const startRow = Math.floor(Math.random() * verticalCells);
const startColumn = Math.floor(Math.random() * horizontalCells);

const stepThroughCell = (row, column) => {
    //if i have visited the cell at [row, column], then return
    if(gird[row][column]){
        return ;
    }

    //Mark is cell being visited
    gird[row][column] = true;

    //Assemble randomly ordered list of neighbour
    const neighbours = shuffle([
        [row - 1, column, 'up'],
        [row, column + 1, 'right'],
        [row + 1, column, 'down'],
        [row, column - 1, 'left']
    ]);

    //For each neighbour
    for(let neighbour of neighbours) {
        const [nextRow, nextColumn, direction] = neighbour;
        // see if the neighbour is out of bound
        if(nextRow < 0 || nextRow >= verticalCells || nextColumn < 0 || nextColumn >= horizontalCells ){
            continue ;
        }

        // if you visited that neighbour, continue to next neighbour
        if(gird[nextRow][nextColumn]){
            continue ;
        }

        // remove a wall either from vertical or horizontal
        if(direction === 'left'){
            verticals[row][column - 1] = true;
        } else if( direction === 'right'){
            verticals[row][column] = true;
        } else if( direction === 'up'){
            horizontals[row - 1][column] = true;
        }else if(direction === 'down'){
            horizontals[row][column] = true;
        }
        stepThroughCell(nextRow,nextColumn);
    }

}

stepThroughCell(1,1);


horizontals.forEach((row, rowIndex) => {
    row.forEach((open, columnIndex) => {
        if(open){
            return ;
        }

        const wall = Bodies.rectangle(
            columnIndex * unitLengthX + unitLengthX /2, rowIndex * unitLengthY + unitLengthY,
            unitLengthX, 2, {
                label: 'wall',
                isStatic: true,
                render: {
                    fillStyle: 'firebrick'
                }
            }
        );
        World.add(world, wall)
    })
})

verticals.forEach((row, rowIndex) => {
    row.forEach((open, columnIndex) => {
        if(open){
            return;
        }

        const wall = Bodies.rectangle(
            columnIndex * unitLengthX + unitLengthX, rowIndex * unitLengthY + unitLengthY / 2,
            2, unitLengthY, {
                label: 'wall',
                isStatic: true,
                render: {
                    fillStyle: 'firebrick'
                }

            }
        )
        World.add(world, wall)
    })
})

// goal
const goal = Bodies.rectangle(
    width - unitLengthX /2, height - unitLengthY/ 2, unitLengthX * 0.7 , unitLengthY * 0.7 , {
        isStatic: true,
        label: 'goal',
        render: {
            fillStyle: 'firebrick'
        }

    }
)

World.add(world, goal)

//Ball

const ballRadius = Math.min(unitLengthX, unitLengthY) / 3.5;
const ball = Bodies.circle(
    unitLengthX/2, unitLengthY/2, ballRadius, {
        label: 'ball',
        render: {
            fillStyle: 'teal'
        }
    }
)

World.add(world, ball)

document.addEventListener('keydown', (event) => {
    const {x, y} = ball.velocity;

    if(event.keyCode === 87){
       Body.setVelocity(ball, {x, y: -5})
    }
    if(event.keyCode === 68){
        Body.setVelocity(ball, {x: 5, y})
    }
    if(event.keyCode === 83){
        Body.setVelocity(ball, {x, y: 5})
    }
    if(event.keyCode === 65){
        Body.setVelocity(ball, {x: -5, y})
    }
})

// Win Condition

Events.on(engine, 'collisionStart', (event) => {
    event.pairs.forEach((collision) => {
        const labels = ['ball', 'goal']

        if(labels.includes(collision.bodyA.label) && labels.includes(collision.bodyB.label)){
            document.querySelector('.winner').classList.remove('hidden');
           world.gravity.y = 1;
           world.bodies.forEach((body) => {
               if(body.label === 'wall'){
                   Body.setStatic(body, false);
               }
           })
        }
    })
})