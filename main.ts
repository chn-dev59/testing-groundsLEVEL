// --- 1. CONSTANTS & STATE ---
const GRAVITY = 500
const MAX_CHARGE = 300
const CHARGE_RATE = 20
const MOVE_SPEED = 60
const TONGUE_RANGE = 112

let lives = 3
let isCharging = false
let chargeLevel = 0
let isGrappling = false
let tongueTarget: Sprite = null
let tongueCount = 1
let currentStage = 0

// --- 2. DATA STRUCTURES ---
interface Platform { x: number; y: number; w: number; h: number; platType: string }
interface Node { x: number; y: number; kind: string }
interface LevelData { spawnX: number; spawnY: number; platforms: Platform[]; nodes: Node[] }

// --- 3. LEVELS (RECALIBRATED) ---
const levels: LevelData[] = [
    {   // Stage 1: The Tutorial
        spawnX: 20, spawnY: 100,
        platforms: [
            // MOUNTAIN 1: Shorter (y increased to 130 to lower the top)
            { x: 0, y: 130, w: 50, h: 10, platType: "normal" },
            // THE PIT FLOOR
            { x: 50, y: 170, w: 110, h: 10, platType: "normal" },
            // MOUNTAIN 2: High Wall (Impossible 140px climb)
            { x: 160, y: 30, w: 20, h: 150, platType: "normal" },
            // GOAL LEDGE
            { x: 180, y: 30, w: 80, h: 10, platType: "normal" }
        ],
        // BUG: Positioned high and right to assist the climb out of the pit
        nodes: [{ x: 160, y: 30, kind: "bug" }]
    },
    {   // Stage 2: Foothills
        spawnX: 20, spawnY: 80,
        platforms: [
            { x: 0, y: 110, w: 50, h: 10, platType: "normal" },
            { x: 80, y: 50, w: 20, h: 70, platType: "normal" },
            { x: 130, y: 70, w: 20, h: 50, platType: "normal" },
            { x: 180, y: 90, w: 20, h: 30, platType: "normal" },
            { x: 230, y: 100, w: 80, h: 20, platType: "normal" }
        ],
        nodes: [{ x: 110, y: 30, kind: "bug" }, { x: 160, y: 40, kind: "bug" }]
    },
    {   // Stage 3: High Peaks
        spawnX: 20, spawnY: 50,
        platforms: [
            { x: 0, y: 120, w: 50, h: 10, platType: "normal" },
            { x: 130, y: 90, w: 10, h: 10, platType: "normal" },
            { x: 250, y: 120, w: 50, h: 10, platType: "normal" }
        ],
        nodes: [{ x: 80, y: 60, kind: "bug" }, { x: 160, y: 40, kind: "bee" }, { x: 220, y: 60, kind: "bug" }]
    },
    {   // Stage 4: The Summit
        spawnX: 20, spawnY: 80,
        platforms: [
            { x: 0, y: 130, w: 80, h: 10, platType: "normal" },
            { x: 110, y: 90, w: 40, h: 10, platType: "normal" },
            { x: 180, y: 60, w: 50, h: 10, platType: "goal" }
        ],
        nodes: [{ x: 140, y: 40, kind: "bug" }, { x: 205, y: 40, kind: "star" }]
    }
]

// --- 4. SPRITES & IMAGES ---
const frogIdle = img`
    . . . . . . . . . . . . . . . . 
    . . . . . . . . . . . . . . . . 
    . . 7 7 7 . . . . . 7 7 7 . . . 
    . 7 7 1 1 7 7 7 7 7 1 1 7 7 . . 
    . 7 7 1 f 7 7 7 7 7 1 f 7 7 . . 
    7 7 7 7 7 7 7 7 7 7 7 7 7 7 7 . 
    7 7 3 3 7 7 7 7 7 7 7 3 3 7 7 . 
    7 7 3 3 7 7 7 7 7 7 7 3 3 7 7 . 
    7 7 7 7 7 7 7 7 7 7 7 7 7 7 7 . 
    7 7 7 7 7 6 6 6 6 6 7 7 7 7 7 . 
    . 7 7 7 7 7 7 7 7 7 7 7 7 7 7 . 
    . . 7 7 . . . . . . . 7 7 . . . 
    . 7 7 7 . . . . . . . 7 7 7 . . 
    . . . . . . . . . . . . . . . . 
`
const frogCharging = img`
    . . . . . . . . . . . . . . . . 
    . . . . . . . . . . . . . . . . 
    . . . . . . . . . . . . . . . . 
    . . . . . . . . . . . . . . . . 
    . . . . . . . . . . . . . . . . 
    . . 4 4 4 . . . . . 4 4 4 . . . 
    . 4 4 1 1 4 4 4 4 4 1 1 4 4 . . 
    . 4 4 1 f 4 4 4 4 4 1 f 4 4 . . 
    4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 . 
    4 4 2 2 4 4 4 4 4 4 4 2 2 4 4 . 
    4 4 2 2 4 4 4 4 4 4 4 2 2 4 4 . 
    4 4 4 4 4 4 4 4 4 4 4 4 4 4 4 . 
    . 4 4 4 . . . . . . . 4 4 4 . . 
`
const flyImg = img`. . . . . . . . . . . . . . . . \n . . . . . . . 7 7 . . . . . . . \n . . . . . . 7 a a 7 . . . . . . \n . . . . . . 7 a a 7 . . . . . . \n . . . . . . . 7 7 . . . . . . .`
const starImg = img`. . . . . . . . . . . . . . . . \n . . . . . . . b . . . . . . . . \n . . . . . . b b b . . . . . . . \n . . . . b b b b b b b . . . . . \n . . . . . b b b b b . . . . . . \n . . . . b b b b b b b . . . . . \n . . . . b b . . . b b . . . . .`
const heartRed = img`. 2 2 . 2 2 . \n 2 2 2 2 2 2 2 \n . . 2 2 2 . .`

let player = sprites.create(frogIdle, SpriteKind.Player)
player.ay = GRAVITY
scene.cameraFollowSprite(player)
scene.setBackgroundColor(9)

function getDistance(s1: Sprite, s2: Sprite): number {
    let dx = s1.x - s2.x;
    let dy = s1.y - s2.y;
    return Math.sqrt(dx * dx + dy * dy);
}

function loadStage(index: number) {
    for (let s of sprites.allOfKind(SpriteKind.Food)) s.destroy()
    for (let b of sprites.allOfKind(SpriteKind.Enemy)) b.destroy()

    let data = levels[index]
    player.setPosition(data.spawnX, data.spawnY)
    isGrappling = false
    tongueTarget = null
    player.ay = GRAVITY

    for (let p of data.platforms) {
        let plat = sprites.create(image.create(p.w, p.h), SpriteKind.Food)
        plat.image.fill(p.platType == "goal" ? 5 : 7)
        plat.setPosition(p.x + p.w / 2, p.y + p.h / 2)
    }
    for (let n of data.nodes) {
        let node = sprites.create(n.kind == "star" ? starImg : flyImg, SpriteKind.Enemy)
        node.setPosition(n.x, n.y)
        if (n.kind != "star") {
            node.vx = 20
            node.setBounceOnWall(true)
        }
    }
}

// --- 5. INPUTS ---
controller.B.onEvent(ControllerButtonEvent.Pressed, function () {
    if (tongueCount > 0) {
        let targets = sprites.allOfKind(SpriteKind.Enemy)
        for (let t of targets) {
            if (t.image != starImg && getDistance(player, t) <= TONGUE_RANGE) {
                isGrappling = true
                tongueTarget = t
                tongueCount = 0
                music.pewPew.play()
                break
            }
        }
    }
})

controller.B.onEvent(ControllerButtonEvent.Released, function () {
    isGrappling = false
    tongueTarget = null
    player.ay = GRAVITY
})

// --- 6. GAME LOOP ---
game.onUpdate(function () {
    let standing = false
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

    if (standing && !isGrappling) {
        tongueCount = 1
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

    if (isGrappling && tongueTarget) {
        player.ay = 0
        player.vx = (player.x < tongueTarget.x) ? 140 : -140
        player.vy = (player.y < tongueTarget.y) ? 140 : -140
    }

    if (player.y > 220) {
        lives -= 1
        if (lives <= 0) game.over(false)
        loadStage(currentStage)
    }
})

// --- 7. UI & OVERLAPS ---
game.onPaint(function () {
    if (isGrappling && tongueTarget) {
        screen.drawLine(player.x - scene.cameraLeft(), player.y - scene.cameraTop(),
            tongueTarget.x - scene.cameraLeft(), tongueTarget.y - scene.cameraTop(), 3)
    }
    for (let i = 0; i < lives; i++) {
        screen.drawImage(heartRed, 5 + (i * 10), 5)
    }
})

sprites.onOverlap(SpriteKind.Player, SpriteKind.Enemy, function (sprite, other) {
    if (other.image == starImg) {
        currentStage++
        if (currentStage < levels.length) loadStage(currentStage)
        else game.over(true)
    }
})

loadStage(0)