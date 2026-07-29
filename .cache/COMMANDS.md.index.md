L1     # mcpoyle CLI Reference
L5     ## Servers
L7     ### `mcpoyle list`
L11    ### `mcpoyle add <name> --command <cmd> [options]`
L27    ### `mcpoyle remove <name>`
L31    ### `mcpoyle enable <name>`
L35    ### `mcpoyle disable <name>`
L39    ### `mcpoyle show <name>`
L45    ## Groups
L47    ### `mcpoyle groups list`
L51    ### `mcpoyle groups create <name> [--description <text>]`
L59    ### `mcpoyle groups delete <name>`
L63    ### `mcpoyle groups show <name>`
L67    ### `mcpoyle groups add-server <group> <server>`
L75    ### `mcpoyle groups remove-server <group> <server>`
L79    ### `mcpoyle groups add-plugin <group> <plugin>`
L87    ### `mcpoyle groups remove-plugin <group> <plugin>`
L91    ### `mcpoyle groups add-skill <group> <skill>`
L99    ### `mcpoyle groups remove-skill <group> <skill>`
L103   ### `mcpoyle groups export <name> [--output <dir>]`
L114   ## Clients
L116   ### `mcpoyle clients`
L142   ### `mcpoyle assign <client> <group> [options]`
L157   ### `mcpoyle unassign <client> [options]`
L172   ## Rules
L174   ### `mcpoyle rules list`
L178   ### `mcpoyle rules add <path> <group>`
L191   ### `mcpoyle rules remove <path>`
L201   ## Skills
L203   ### `mcp skills list`
L207   ### `mcp skills add <name> [options]`
L221   ### `mcp skills remove <name>`
L225   ### `mcp skills show <name>`
L229   ### `mcp skills enable <name>` / `mcp skills disable <name>`
L233   ### `mcp skills sync [<client>] [--dry-run]`
L243   ### `mcp skills search <query>`
L249   ## Pin / Track
L251   ### `mcp pin <name>`
L255   ### `mcp track <name>`
L261   ## Collision Detection
L263   ### `mcp collisions`
L269   ## Dependency Intelligence
L271   ### `mcp deps`
L277   ## Search
L279   ### `mcpoyle search <query> [--limit <n>]`
L290   ## Scope
L292   ### `mcpoyle scope <name> --project <path>`
L317   ## Init
L319   ### `mcpoyle init [options]`
L345   ## Sync
L347   ### `mcpoyle sync [<client>] [options]`
L376   ### `mcpoyle import <client>`
L389   ## Doctor
L391   ### `mcpoyle doctor [options]`
L424   ## Plugins (Claude Code)
L428   ### `mcpoyle plugins list`
L432   ### `mcpoyle plugins install <name> [options]`
L450   ### `mcpoyle plugins uninstall <name>`
L454   ### `mcpoyle plugins enable <name>`
L458   ### `mcpoyle plugins disable <name>`
L462   ### `mcpoyle plugins show <name>`
L466   ### `mcpoyle plugins import`
L476   ## Marketplaces (Claude Code)
L478   ### `mcpoyle marketplaces list`
L482   ### `mcpoyle marketplaces add <name> [options]`
L500   ### `mcpoyle marketplaces remove <name>`
L504   ### `mcpoyle marketplaces show <name>`
L510   ## Registry
L512   ### `mcpoyle registry search <query> [--no-cache]`
L516   ### `mcpoyle registry show <id> [--no-cache]`
L520   ### `mcpoyle registry add <id> [options]`
L534   ### `mcpoyle registry backends`
L538   ### `mcpoyle registry cache-clear`
L544   ## Configuration
L548   ### Project-Level Assignments (Claude Code)
L563   ### Plugin Config Paths