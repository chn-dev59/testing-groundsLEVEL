// --- 1. CONSTANTS & STATE ---
const GRAVITY = 500
const MAX_CHARGE = 300
const CHARGE_RATE = 20
const MOVE_SPEED = 60
// const TONGUE_RANGE = 112 // Commented out for now

let lives = 3
let isCharging = false
let chargeLevel = 0
// let isGrappling = false // Commented out for now
// let tongueTarget: Sprite = null
let tongueCount = 1
let currentStage = 0

// --- 2. DATA STRUCTURES ---
interface Platform { x: number; y: number; w: number; h: number; platType: string }
interface Node { x: number; y: number; kind: string }
interface LevelData { spawnX: number; spawnY: number; platforms: Platform[]; nodes: Node[] }

// --- 3. LEVELS (SCALED UP TO 320px+ WIDTH) ---
const levels: LevelData[] = [
    {   // Level 1: Ki (Intro - Scaled IMG_4584)
        spawnX: 10, spawnY: 40,
        platforms: [
            { x: 0, y: 80, w: 60, h: 40, platType: "normal" },
            { x: 80, y: 100, w: 60, h: 20, platType: "normal" },
            { x: 160, y: 80, w: 60, h: 40, platType: "normal" },
            { x: 240, y: 110, w: 40, h: 10, platType: "normal" },
            { x: 300, y: 50, w: 40, h: 70, platType: "normal" },
            { x: 350, y: 80, w: 40, h: 40, platType: "goal" }
        ],
        nodes: [] // Bug removed
    },
    {   // Level 2: Sho (Challenge - Scaled IMG_4585)
        spawnX: 10, spawnY: 40,
        platforms: [
            { x: 0, y: 80, w: 50, h: 40, platType: "normal" },
            { x: 100, y: 80, w: 50, h: 40, platType: "normal" },
            { x: 180, y: 65, w: 50, h: 10, platType: "normal" },
            { x: 260, y: 45, w: 50, h: 10, platType: "normal" },
            { x: 340, y: 30, w: 40, h: 90, platType: "goal" }
        ],
        nodes: []
    },
    {   // Level 3: Ten (Twist - Scaled IMG_4622)
        spawnX: 10, spawnY: 60,
        platforms: [
            { x: 0, y: 90, w: 50, h: 30, platType: "normal" },
            { x: 80, y: 50, w: 60, h: 10, platType: "normal" },
            { x: 170, y: 100, w: 30, h: 20, platType: "normal" },
            { x: 230, y: 40, w: 50, h: 80, platType: "normal" },
            { x: 310, y: 80, w: 30, h: 40, platType: "normal" },
            { x: 320, y: 25, w: 30, h: 10, platType: "goal" }
        ],
        nodes: []
    },
    {   // Level 4: Ketsu (Conclusion - Scaled IMG_4623)
        spawnX: 10, spawnY: 60,
        platforms: [
            { x: 0, y: 100, w: 80, h: 20, platType: "normal" },
            { x: 100, y: 40, w: 40, h: 10, platType: "normal" },
            { x: 100, y: 75, w: 70, h: 10, platType: "normal" },
            { x: 200, y: 85, w: 80, h: 10, platType: "normal" },
            { x: 250, y: 100, w: 50, h: 20, platType: "normal" },
            { x: 330, y: 70, w: 50, h: 10, platType: "goal" }
        ],
        nodes: []
    }
]

// --- 4. SPRITES & IMAGES ---
const frogIdle = img`
    . . . . . . . . . . . . . . . . 
    . . 7 7 7 . . . . . 7 7 7 . . . 
    . 7 7 1 1 7 7 7 7 7 1 1 7 7 . . 
    . 7 7 1 f 7 7 7 7 7 1 f 7 7 . . 
    7 7 7 7 7 7 7 7 7 7 7 7 7 7 7 . 
    7 7 3 3 7 7 7 7 7 7 7 3 3 7 7 . 
    7 7 7 7 7 7 7 7 7 7 7 7 7 7 7 . 
    7 7 7 7 7 6 6 6 6 6 7 7 7 7 7 . 
    . 7 7 7 7 7 7 7 7 7 7 7 7 7 7 . 
    . . 7 7 . . . . . . . 7 7 . . . 
`
const frogCharging = img`
    . . . . . . . . . . . . . . . . 
    . . 4 4 4 . . . . . 4 4 4 . . . 
    . 4 4 1 1 4 4 4 4 4 1 1 4 4 . . 
    . 4 4 1 f 4 4 4 4 4 1 f 4 4 . . 
    4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 . 
    4 4 2 2 4 4 4 4 4 4 4 2 2 4 4 . 
    4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 . 
    . 4 4 4 . . . . . . . 4 4 4 . . 
`
const starImg = img`. . . . . . . . . . . . . . . . \n . . . . . . . b . . . . . . . . \n . . . . . . b b b . . . . . . . \n . . . . b b b b b b b . . . . . \n . . . . . b b b b b . . . . . . \n . . . . b b b b b b b . . . . . \n . . . . b b . . . b b . . . . .`
const heartRed = img`. 2 2 . 2 2 . \n 2 2 2 2 2 2 2 \n . . 2 2 2 . .`

let player = sprites.create(frogIdle, SpriteKind.Player)
player.ay = GRAVITY
scene.cameraFollowSprite(player)
scene.setBackgroundColor(9)

function loadStage(index: number) {
    for (let s of sprites.allOfKind(SpriteKind.Food)) s.destroy()
    for (let b of sprites.allOfKind(SpriteKind.Enemy)) b.destroy()

    let data = levels[index]
    player.setPosition(data.spawnX, data.spawnY)
    // isGrappling = false
    player.ay = GRAVITY

    for (let p of data.platforms) {
        let plat = sprites.create(image.create(p.w, p.h), SpriteKind.Food)
        plat.image.fill(p.platType == "goal" ? 5 : 7)
        plat.setPosition(p.x + p.w / 2, p.y + p.h / 2)

        // If it's the goal platform, place the star on top of it
        if (p.platType == "goal") {
            let star = sprites.create(starImg, SpriteKind.Enemy)
            star.setPosition(p.x + p.w / 2, p.y - 10)
        }
    }

    // FLY SPAWNING COMMENTED OUT
    /*
    for (let n of data.nodes) {
        let node = sprites.create(flyImg, SpriteKind.Enemy)
        node.setPosition(n.x, n.y)
        node.vx = 15 
        node.setBounceOnWall(true)
    }
    */
}

// GRAPPLE CONTROLS COMMENTED OUT
/*
controller.B.onEvent(ControllerButtonEvent.Pressed, function () {
    // Grapple logic here...
})
*/

// --- 6. CORE LOGIC ---
game.onUpdate(function () {
    let standing = false

    // Collision Logic
    for (let p of sprites.allOfKind(SpriteKind.Food)) {
        if (player.overlapsWith(p)) {
            let overlapLeft = player.right - p.left;
            let overlapRight = p.right - player.left;
            let overlapTop = player.bottom - p.top;
            let overlapBottom = p.bottom - player.top;
            let minOverlap = Math.min(Math.min(overlapLeft, overlapRight), Math.min(overlapTop, overlapBottom));

            if (minOverlap == overlapTop && player.vy >= 0) {
                player.bottom = p.top + 1;
                player.vy = 0;
                standing = true;
            } else if (minOverlap == overlapBottom && player.vy < 0) {
                player.top = p.bottom;
                player.vy = 0;
            } else if (minOverlap == overlapLeft) {
                player.right = p.left;
                player.vx = 0;
            } else if (minOverlap == overlapRight) {
                player.left = p.right;
                player.vx = 0;
            }
        }
    }

    // Jumping (Only if standing)
    if (standing) {
        player.vx = 0
        if (controller.A.isPressed()) {
            isCharging = true
            player.setImage(frogCharging)
            if (chargeLevel < MAX_CHARGE) chargeLevel += CHARGE_RATE
            player.sayText(Math.floor((chargeLevel / MAX_CHARGE) * 100) + "%")
        } else if (isCharging) {
            player.sayText("")
            player.vy = -chargeLevel
            player.vx = MOVE_SPEED
            isCharging = false
            chargeLevel = 0
            player.setImage(frogIdle)
        }
    }

    // Death / Pit (Increased y limit for taller maps)
    if (player.y > 180) {
        lives -= 1
        if (lives <= 0) game.over(false)
        loadStage(currentStage)
    }
})

// --- 7. UI ---
game.onPaint(function () {
    for (let i = 0; i < lives; i++) {
        // Draw hearts relative to screen, not world
        screen.drawImage(heartRed, 5 + (i * 10), 5)
    }
})

sprites.onOverlap(SpriteKind.Player, SpriteKind.Enemy, function (sprite, other) {
    if (other.image == starImg) {
        currentStage++
        if (currentStage < levels.length) {
            effects.confetti.startScreenEffect(500)
            loadStage(currentStage)
        } else {
            game.over(true)
        }
    }
})

loadStage(0)