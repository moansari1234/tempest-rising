# ⚔️ Combat System & Skills Reference

## 1. Rimuru's Skill Arsenal

### 1.1 Intrinsic Skills (Default Kit)
* **Water Blade (`[Z]` Light Combo):**
  * *Type:* Physical / Magical Water Slashing
  * *Frame Data:* Startup $4\text{ frames}$, Active $3\text{ frames}$, Recovery $6\text{ frames}$.
  * *Damage:* $12 \rightarrow 14 \rightarrow 18\text{ DMG}$.
* **Heavy Cleave (`[X]`):**
  * *Type:* Kinetic Slime Expansion Strike
  * *Frame Data:* Startup $8\text{ frames}$, Active $4\text{ frames}$, Recovery $12\text{ frames}$.
  * *Damage:* $28\text{ DMG}$ ($+40\text{ DMG}$ on staggered targets).
* **Parry Shield (`[C]`):**
  * *Window:* $10\text{ frames}$ ($166\text{ms}$).
  * *Effect:* Negates incoming damage, reflects projectiles, and inflicts Stagger on melee attackers.
* **Unique Skill: Predator (`[E]`):**
  * *Effect:* Channeled suction vortex ($140\text{px}$ radius). Absorbs targets below $35\%\text{ HP}$.
  * *Resource Cost:* $0\text{ MP}$ (Restores $+20\text{ MP}$ and $+25\text{ HP}$ on successful absorption).

---

## 2. Acquired Skills (Devour Evolutions)

When Rimuru devours specific enemies and bosses, Great Sage analyzes the target and registers new passive and active traits:

| Target | Acquired Trait / Skill | Classification | Effect |
| :--- | :--- | :--- | :--- |
| **Goblin Scout** | *Shadow Step* | Passive Extra Skill | Dash speed increased by $+25\%$; dash cooldown reduced to $0.4\text{s}$. |
| **Goblin Sharpshooter** | *Poison Needle* | Active Combat Skill | Attacks inflict a 3-second toxic poison DOT dealing $4\text{ dmg/sec}$. |
| **Cave Serpent** | *Scale Armor* | Passive Defense Skill | Base defense $+5$; reduces projectile damage taken by $30\%$. |
| **Magisteel Ore** | *Magisteel Body* | Material Synthesis | Max HP $+20$; melee knockback resistance $+50\%$. |
| **Hipokute Herb** | *Rapid Regeneration* | Passive Recovery | Passively regenerates $+2\text{ HP/sec}$ when out of combat for $4\text{s}$. |
| **Tempest Serpent Boss** | *Dragon Water Pulse* | Intrinsic Evolution | Water Blade expands into wide hydro-crescent waves with piercing properties. |

---

## 3. Combat Mechanics & Calculations

### 3.1 Damage Formula
$$\text{Damage Dealt} = \max\left(1, \left(\text{Attacker ATK} \times \text{Multiplier}\right) - \frac{\text{Defender DEF}}{2}\right)$$

### 3.2 Hitstop & Freeze Frames
* **Light Attack Hit:** $40\text{ms}$ hitstop freeze.
* **Heavy Attack Hit:** $80\text{ms}$ hitstop freeze + $12\text{px}$ screen shake.
* **Parry Success:** $120\text{ms}$ global freeze + golden flash + chime SFX.
* **Devour Trigger:** $300\text{ms}$ vortex suction with dynamic screen distortion.

### 3.3 Enemy Status States
* **Normal:** Default movement and patrol state.
* **Aggro:** Player entered line of sight or proximity radius.
* **Staggered:** Interrupted by parry or heavy poise break. Vulnerable to critical damage.
* **Weakened (Devourable):** HP dropped below $35\%$. A glowing `[E] DEVOUR` badge appears over the target.
* **Decaying:** Enemy defeated; fades into ethereal blue magicule particles over $1.5\text{s}$.
