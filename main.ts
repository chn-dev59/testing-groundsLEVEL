// --- 1. CONSTANTS & STATE ---
const GRAVITY = 500
const MAX_CHARGE = 300
const CHARGE_RATE = 20
const MOVE_SPEED = 60
const TONGUE_RANGE = 112 // 7 blocks distance from the working code

let lives = 3
let isCharging = false
let chargeLevel = 0
let isGrappling = false
let tongueTarget: Sprite = null
let tongueCount = 1
let currentStage = 0

// --- 2. DATA STRUCTURES (UNTOUCHED) ---
interface Platform { x: number; y: number; w: number; h: number; platType: string }
interface Node { x: number; y: number; kind: string }
interface LevelData { spawnX: number; spawnY: number; platforms: Platform[]; nodes: Node[] }

// --- 3. WORKSHEET LEVELS (UNTOUCHED) ---
const levels: LevelData[] = [
    {   // Stage 1: Ki
        spawnX: 20, spawnY: 50,
        platforms: [
            { x: 0, y: 100, w: 70, h: 20, platType: "normal" },
            { x: 100, y: 60, w: 30, h: 60, platType: "normal" },
            { x: 170, y: 60, w: 30, h: 60, platType: "normal" },
            { x: 230, y: 100, w: 100, h: 20, platType: "normal" }
        ],
        nodes: [{ x: 115, y: 20, kind: "bug" }, { x: 185, y: 20, kind: "bug" }]
    },
    {   // Stage 2: Sho
        spawnX: 20, spawnY: 80,
        platforms: [
            { x: 0, y: 110, w: 50, h: 10, platType: "normal" },
            { x: 80, y: 90, w: 40, h: 10, platType: "normal" },
            { x: 150, y: 70, w: 40, h: 10, platType: "normal" },
            { x: 220, y: 50, w: 60, h: 10, platType: "normal" }
        ],
        nodes: [{ x: 100, y: 40, kind: "bug" }]
    },
    {   // Stage 3: Ten
        spawnX: 20, spawnY: 50,
        platforms: [
            { x: 0, y: 90, w: 80, h: 10, platType: "normal" },
            { x: 250, y: 90, w: 80, h: 10, platType: "normal" }
        ],
        nodes: [{ x: 160, y: 40, kind: "bee" }]
    },
    {   // Stage 4: Ketsu
        spawnX: 20, spawnY: 80,
        platforms: [
            { x: 0, y: 110, w: 100, h: 10, platType: "normal" },
            { x: 150, y: 80, w: 60, h: 10, platType: "goal" }
        ],
        nodes: [{ x: 180, y: 50, kind: "star" }]
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

// --- 5. HELPER: DISTANCE ---
function getDistance(s1: Sprite, s2: Sprite): number {
    let dx = s1.x - s2.x;
    let dy = s1.y - s2.y;
    return Math.sqrt(dx * dx + dy * dy);
}

// --- 6. THE BUILDER FUNCTION (MAINTAINS WORKSHEET) ---
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
        // Apply working fly movement
        if (n.kind != "star") {
            node.vx = 40
            node.setBounceOnWall(true)
        }
    }
}

// --- 7. GRAPPLE ACTION (FROM WORKING CODE) ---
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

// --- 8. CORE LOGIC ---
game.onUpdate(function () {
    let standing = false
    for (let p of sprites.allOfKind(SpriteKind.Food)) {
        if (player.overlapsWith(p) && player.vy > 0 && player.y < p.y) {
            player.bottom = p.top
            player.vy = 0
            standing = true
        }
    }

    if (standing && !isGrappling) {
        tongueCount = 1
        player.vx = 0
        // Working Jump Calculation
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
        player.vx = (player.x < tongueTarget.x) ? 120 : -120
        player.vy = (player.y < tongueTarget.y) ? 120 : -120

        if (getDistance(player, tongueTarget) > TONGUE_RANGE + 20) {
            isGrappling = false
            tongueTarget = null
            player.ay = GRAVITY
        }
    }

    if (player.y > 150) {
        lives -= 1
        if (lives <= 0) game.over(false)
        loadStage(currentStage)
    }
})

// --- 9. UI & GOALS ---
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
