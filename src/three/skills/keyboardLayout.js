import { skills } from '../../data/skills'

export const COLUMNS = 10

// Plain data (no three.js) so the DOM can share key ids with the 3D board.
// Row 0 is the function row, rows 1–3 hold the skills, row 4 is the space bar.
function build() {
  const keys = []
  const add = (row, x, width, extra) => keys.push({ row, x, width, id: `k${keys.length}`, ...extra })

  add(0, 0, 1, { tone: 'accent', label: 'esc' })
  for (let c = 1; c < COLUMNS; c++) add(0, c, 1, { tone: 'mod' })

  for (let row = 1; row <= 3; row++) {
    let col = 0
    while (col < COLUMNS) {
      const skill = skills.find((s) => s.row === row && s.col === col)
      if (skill) {
        const width = skill.wide ? 2 : 1
        add(row, col, width, { skill })
        col += width
      } else {
        add(row, col, 1, { tone: col === 0 || col === COLUMNS - 1 ? 'mod' : 'blank' })
        col += 1
      }
    }
  }
  add(4, 0, 1.5, { tone: 'mod' })
  add(4, 1.5, 7, { tone: 'blank', label: 'space for ideas' })
  add(4, 8.5, 1.5, { tone: 'accent' })
  return keys
}

export const keyboardLayout = build()

export const keyIdForSkill = new Map(keyboardLayout.filter((k) => k.skill).map((k) => [k.skill.id, k.id]))
