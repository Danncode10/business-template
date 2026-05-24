#!/bin/bash

# Color definitions
RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color
BOLD='\033[1m'

# ASCII Art Header
show_header() {
    clear
    echo -e "${BLUE}${BOLD}"
    cat << "EOF"
  _____                   ______ _               
 |  __ \                 |  ____| |              
 | |  | | __ _ _ __  _ __| |__  | | _____      __
 | |  | |/ _` | '_ \| '_ \  __| | |/ _ \ \ /\ / /
 | |__| | (_| | | | | | | | |   | | (_) \ V  V / 
 |_____/ \__,_|_| |_|_| |_|_|   |_|\___/ \_/\_/  
                                                 
EOF
    echo -e "${NC}"
    echo -e "${CYAN}The AI-Native Next.js SaaS Starter for Vibe Coding${NC}\n"
}

# Run a step by index (0-based)
run_step() {
    case "$1" in
        0) show_claude ;;
        1) show_supabase ;;
        2) show_env ;;
        3) show_vibe ;;
        4) show_security ;;
        5) show_ui ;;
        6) show_ready ;;
        7) show_deploy ;;
    esac
}

# Interactive Main Menu
show_main() {
    local labels=(
        "Step 1: Set up Claude Code environment (CLAUDE.md + commands)"
        "Step 2: Create Supabase project, Auth, and SMTP"
        "Step 3: Set up environment variables (.env.local)"
        "Step 4: Connect AI Agents (MCPs/Cursor/Antigravity)"
        "Step 5: Setup Gmail security notifications"
        "Step 6: Customize your brand theme & colors"
        "Step 7: Final checklist & rebrand (resets Git history)"
        "Step 8: Deploy to Vercel (Production)"
    )
    local count=${#labels[@]}
    local selected=0

    while true; do
        show_header
        echo -e "${BOLD}Getting Started Guide${NC}"
        echo -e "Use ${CYAN}↑ ↓${NC} to navigate  ${GREEN}Enter${NC} to open  ${YELLOW}q${NC} to quit\n"

        for i in "${!labels[@]}"; do
            if [ "$i" -eq "$selected" ]; then
                echo -e "  ${GREEN}${BOLD}› ${labels[$i]}${NC}"
            else
                echo -e "    ${labels[$i]}"
            fi
        done

        echo ""
        echo -e "Other helpful commands:"
        echo -e "  ${CYAN}./guide.sh commands${NC}        - List all DannFlow slash commands"
        echo -e "  ${CYAN}./guide.sh ruflo-commands${NC}  - Show Ruflo MCP tools (agents, memory, swarms)"
        echo -e "  ${CYAN}./guide.sh workflow${NC}        - Show the daily Vibe Coding loop"
        echo -e "  ${CYAN}./guide.sh vibe-check${NC}      - Quick health check (env, MCP, backups, types)"
        echo -e "  ${CYAN}./guide.sh skills-update${NC}   - Pull latest skill packs (3 taste + 3 quality + 2 marketing)"
        echo -e "  ${CYAN}npm run dev${NC}               - Start development server"

        # Read keypress
        IFS= read -rsn1 key < /dev/tty
        if [[ "$key" == $'\x1b' ]]; then
            read -rsn2 key < /dev/tty
            case "$key" in
                '[A') # Up arrow
                    ((selected--))
                    [ "$selected" -lt 0 ] && selected=$((count - 1))
                    ;;
                '[B') # Down arrow
                    ((selected++))
                    [ "$selected" -ge "$count" ] && selected=0
                    ;;
            esac
        elif [[ "$key" == '' ]]; then # Enter
            run_step "$selected"
        elif [[ "$key" == 'q' || "$key" == 'Q' ]]; then
            clear
            break
        fi
    done
}

# Env Command
show_env() {
    show_header
    echo -e "${BOLD}🌍 Environment Configuration${NC}\n"
    echo -e "Your ${CYAN}.env.local${NC} file holds your secrets. It is ignored by Git to"
    echo -e "keep your credentials safe. Never share this file.\n"
    
    echo -e "${BOLD}1. Initialize File${NC}"
    echo -e "   Run: ${CYAN}cp .env.example .env.local${NC}\n"
    
    echo -e "${BOLD}2. Database Credentials${NC}"
    echo -e "   Find these in ${YELLOW}Supabase > Project Settings > Data API${NC}:"
    echo -e "   - ${CYAN}NEXT_PUBLIC_SUPABASE_URL${NC}       (The API endpoint)"
    echo -e "   - ${CYAN}NEXT_PUBLIC_SUPABASE_ANON_KEY${NC}  (Client-side key)"
    echo -e "   - ${CYAN}SUPABASE_SERVICE_ROLE_KEY${NC}      (Admin key - KEEP SECRET)\n"
    
    echo -e "${BOLD}3. Site Branding & SEO${NC}"
    echo -e "   - ${CYAN}NEXT_PUBLIC_SITE_NAME${NC}: Your app's display name."
    echo -e "   - ${CYAN}NEXT_PUBLIC_SITE_URL${NC}: Set to ${YELLOW}http://localhost:3000${NC} for now."
    echo -e "   - ${CYAN}NEXT_PUBLIC_GITHUB_URL${NC}: Link to your main repository.\n"
    
    echo -e "${BOLD}4. Rate Limiting (Upstash Redis)${NC}"
    echo -e "   Required for server-side protection. Get these from ${CYAN}console.upstash.com${NC}:"
    echo -e "   - ${CYAN}UPSTASH_REDIS_REST_URL${NC}"
    echo -e "   - ${CYAN}UPSTASH_REDIS_REST_TOKEN${NC}\n"

    echo -e "📖 See ${BLUE}docs/dannflow_docs/production-features.md${NC} for more details on env vars."
    step_footer
}

# Supabase Command
show_supabase() {
    show_header
    echo -e "${BOLD}⚡ Supabase Setup${NC}\n"

    # Auto-create .env.local if missing
    if [ ! -f .env.local ]; then
        echo -e "${YELLOW}⚠️  .env.local not found.${NC}\n"
        ask_yes_no "Create .env.local from .env.example now?"
        if [ "$?" -eq 0 ]; then
            if [ -f .env.example ]; then
                cp .env.example .env.local
                echo -e "  ✅ ${GREEN}.env.local created.${NC} Open it and fill in your credentials as you go.\n"
            else
                echo -e "  ${RED}❌ .env.example not found. Check your project files.${NC}\n"
            fi
        else
            echo -e "  ${YELLOW}Skipped. You can run: ${CYAN}cp .env.example .env.local${NC} anytime.\n"
        fi
    else
        echo -e "  ✅ ${GREEN}.env.local already exists.${NC}\n"
    fi

    echo -e "${BOLD}1. Project Creation${NC}"
    echo -e "   - Go to ${CYAN}supabase.com/dashboard${NC} and click ${YELLOW}New Project${NC}."
    echo -e "   - Set your ${YELLOW}Project Name${NC} and a secure ${YELLOW}Database Password${NC}. Save the password!"
    echo -e "   - ${RED}${BOLD}WARNING (Free Tier):${NC} Supabase allows only ${BOLD}2 active projects${NC}."
    echo -e "     If you already have 2, ${YELLOW}pause or delete${NC} one first.\n"

    echo -e "${BOLD}2. Get Your Credentials${NC}"
    echo -e "   Go to ${CYAN}Project Settings > Data API${NC}:"
    echo -e "   - Copy ${CYAN}NEXT_PUBLIC_SUPABASE_URL${NC}      → your API endpoint"
    echo -e "   - Copy ${CYAN}NEXT_PUBLIC_SUPABASE_ANON_KEY${NC} → client-side key"
    echo -e "   - Copy ${CYAN}SUPABASE_SERVICE_ROLE_KEY${NC}     → admin key (keep secret)"
    echo -e "   Paste these into your ${CYAN}.env.local${NC} file (Step 2).\n"

    echo -e "${BOLD}3. URL Configuration${NC}"
    echo -e "   Go to ${CYAN}Authentication > URL Configuration${NC}:"
    echo -e "   - ${BOLD}Site URL${NC}:      Set to your live production domain (or localhost for now)."
    echo -e "   - ${BOLD}Redirect URLs${NC}: Add ${YELLOW}http://localhost:3000/**${NC}"
    echo -e "   - ${BOLD}Redirect URLs${NC}: Add ${YELLOW}https://yourdomain.com/**${NC} (after deploy)\n"

    echo -e "${BOLD}4. AI Orchestration — Apply Schema (Vibe Coding)${NC}"
    echo -e "   Once your Supabase MCP is connected (Step 3), paste this to your AI:\n"
    echo -e "   ${CYAN}\"I've created a new Supabase project. Ask me for the Project"
    echo -e "   Reference ID. Once provided:"
    echo -e "   1. Connect to the project via Supabase MCP."
    echo -e "   2. Find the latest .sql file in supabase/backups/ and apply it."
    echo -e "   3. MANDATORY: list all tables and functions in the public schema."
    echo -e "   4. Confirm the 'profiles' table and 'handle_new_user' function exist."
    echo -e "   Do not report success until you can see them in the live DB.\"${NC}\n"

    echo -e "${BOLD}5. Post-Provision Verification${NC}"
    echo -e "   After the schema is applied, paste this to your AI:\n"
    echo -e "   ${CYAN}\"Schema applied successfully. Now:"
    echo -e "   1. Run /checkpoint to snapshot the current state."
    echo -e "   2. Run npm run update-types to regenerate TypeScript types."
    echo -e "   3. Confirm src/types/supabase.ts was regenerated."
    echo -e "   Report the list of generated types.\"${NC}\n"

    echo -e "💡 Gmail SMTP setup is in ${CYAN}Step 5 → ./guide.sh security${NC}"
    echo -e "📖 Full walkthrough: ${BLUE}docs/dannflow_docs/production-features.md${NC}"
    step_footer
}

# Yes/No selector — returns 0 for Yes, 1 for No
ask_yes_no() {
    local question="$1"
    local selected=0
    while true; do
        printf "\n  ${BOLD}%s${NC}\n" "$question"
        if [ "$selected" -eq 0 ]; then
            printf "    ${GREEN}${BOLD}› Yes${NC}\n      No\n"
        else
            printf "      Yes\n    ${GREEN}${BOLD}› No${NC}\n"
        fi
        IFS= read -rsn1 key < /dev/tty
        if [[ "$key" == $'\x1b' ]]; then
            read -rsn2 key < /dev/tty
            [[ "$key" == '[A' || "$key" == '[B' ]] && ((selected = 1 - selected))
        elif [[ "$key" == '' ]]; then
            printf "\033[4A\033[0J"
            if [ "$selected" -eq 0 ]; then
                echo -e "  ${BOLD}$question${NC} → ${GREEN}Yes${NC}\n"
            else
                echo -e "  ${BOLD}$question${NC} → ${YELLOW}No${NC}\n"
            fi
            return $selected
        fi
        printf "\033[4A\033[0J"
    done
}

# Step footer — press g to return to menu, q to quit
step_footer() {
    echo -e "${CYAN}────────────────────────────────────────${NC}"
    echo -e "  ${YELLOW}g${NC} → Back to menu   ${YELLOW}q${NC} → Quit"
    IFS= read -rsn1 key < /dev/tty
    if [[ "$key" == 'g' || "$key" == 'G' ]]; then
        show_main
    elif [[ "$key" == 'q' || "$key" == 'Q' ]]; then
        clear
        exit 0
    fi
}

# Vibe Command
show_vibe() {
    local vibe_options=("Setup MCPs (run wizard)" "View setup instructions")
    local vibe_selected=0

    while true; do
        show_header
        echo -e "${BOLD}🤖 Step 3 — Connect AI Agents${NC}\n"
        echo -e "MCPs give your AI live access to your database and GitHub."
        echo -e "Without them, your AI is guessing. With them, it ${GREEN}knows${NC}.\n"
        echo -e "Use ${CYAN}↑ ↓${NC} to navigate  ${GREEN}Enter${NC} to select  ${YELLOW}g${NC} → menu  ${YELLOW}q${NC} → quit\n"

        for i in "${!vibe_options[@]}"; do
            if [ "$i" -eq "$vibe_selected" ]; then
                echo -e "  ${GREEN}${BOLD}› ${vibe_options[$i]}${NC}"
            else
                echo -e "    ${vibe_options[$i]}"
            fi
        done

        IFS= read -rsn1 key < /dev/tty
        if [[ "$key" == $'\x1b' ]]; then
            read -rsn2 key < /dev/tty
            case "$key" in
                '[A') ((vibe_selected--)); [ "$vibe_selected" -lt 0 ] && vibe_selected=1 ;;
                '[B') ((vibe_selected++)); [ "$vibe_selected" -gt 1 ] && vibe_selected=0 ;;
            esac
        elif [[ "$key" == '' ]]; then
            break
        elif [[ "$key" == 'g' || "$key" == 'G' ]]; then
            show_main; return
        elif [[ "$key" == 'q' || "$key" == 'Q' ]]; then
            clear; exit 0
        fi
    done

    # Option 1: Instructions only
    if [ "$vibe_selected" -eq 1 ]; then
        show_header
        echo -e "${BOLD}🤖 MCP Setup Instructions${NC}\n"
        echo -e "${BOLD}What you need:${NC}"
        echo -e "  ${YELLOW}Supabase token${NC}  → supabase.com → Account (top right) → Access Tokens → Generate"
        echo -e "  ${YELLOW}GitHub token${NC}    → github.com/settings/tokens → Generate new token (classic)"
        echo -e "              Scopes: ${CYAN}repo${NC}, ${CYAN}read:org${NC}\n"
        echo -e "${BOLD}Antigravity:${NC}"
        echo -e "  Chats → MCP Servers → Manage MCP Servers → View Raw Config → paste ${CYAN}mcpServers${NC} block\n"
        echo -e "${BOLD}Claude Code:${NC}"
        echo -e "  Run: ${CYAN}claude mcp add-json supabase-mcp-server --scope user '{...}'${NC}"
        echo -e "  ${CYAN}--scope user${NC} = applies to all your projects globally\n"
        echo -e "${BOLD}MCP Management:${NC}"
        echo -e "  ${CYAN}claude mcp list${NC}                        — list all MCPs + status"
        echo -e "  ${CYAN}claude mcp remove supabase-mcp-server${NC}  — remove Supabase MCP"
        echo -e "  ${CYAN}claude mcp remove github-mcp-server${NC}    — remove GitHub MCP\n"
        echo -e "Run ${CYAN}./guide.sh 3${NC} and select ${GREEN}Setup MCPs${NC} to configure automatically."
        step_footer
        return
    fi

    # Option 0: Wizard
    show_header
    echo -e "${BOLD}🤖 MCP Setup Wizard${NC}\n"
    echo -e "${BOLD}Step 1 — Get your tokens before continuing${NC}"
    echo -e "  ${YELLOW}Supabase${NC} → supabase.com → Account (top right) → Access Tokens → Generate new token"
    echo -e "  ${YELLOW}GitHub${NC}   → github.com/settings/tokens → Generate new token (classic)"
    echo -e "           Scopes needed: ${CYAN}repo${NC}, ${CYAN}read:org${NC}\n"

    read -p "  Paste your Supabase Access Token: " supabase_token < /dev/tty
    echo ""
    read -p "  Paste your GitHub Personal Access Token: " github_token < /dev/tty
    echo ""

    if [ -z "$supabase_token" ] || [ -z "$github_token" ]; then
        echo -e "${RED}❌ Both tokens are required. Run ./guide.sh 3 again when ready.${NC}"
        return
    fi

    # Optional: limit Supabase MCP to one project
    project_ref_flag=""
    ask_yes_no "Limit Supabase AI access to this project only? (Recommended)"
    if [ "$?" -eq 0 ]; then
        echo -e "  ${YELLOW}Find your Project Ref:${NC} Supabase Dashboard → Project Settings → General → Reference ID"
        read -p "  Paste your Project Reference ID: " project_ref < /dev/tty
        echo ""
        if [ -n "$project_ref" ]; then
            project_ref_flag="--project-ref $project_ref"
            echo -e "  ✅ ${GREEN}Supabase MCP will only access project: ${CYAN}$project_ref${NC}\n"
        else
            echo -e "  ${YELLOW}⚠️  Skipped — AI will have access to all your Supabase projects.${NC}\n"
        fi
    else
        echo -e "  ${YELLOW}⚠️  AI will have access to ALL your Supabase projects.${NC}\n"
    fi

    # Detect node/npx paths
    node_path=$(which node 2>/dev/null || echo "/opt/homebrew/bin/node")
    npx_path=$(which npx 2>/dev/null || echo "/opt/homebrew/bin/npx")

    ask_yes_no "Are you using Antigravity?"
    use_antigravity=$?

    ask_yes_no "Are you using Claude Code?"
    use_claude=$?

    if [ "$use_antigravity" -eq 1 ] && [ "$use_claude" -eq 1 ]; then
        echo -e "${YELLOW}⚠️  No tools selected. Run ./guide.sh 3 again and select at least one.${NC}"
        return
    fi

    # Build Supabase args array (with optional --project-ref)
    supabase_args_json="\"$npx_path\",\"-y\",\"@supabase/mcp-server-supabase@latest\",\"--access-token\",\"$supabase_token\""
    supabase_args_sh=("$npx_path" "-y" "@supabase/mcp-server-supabase@latest" "--access-token" "$supabase_token")
    if [ -n "$project_ref" ]; then
        supabase_args_json+=",\"--project-ref\",\"$project_ref\""
        supabase_args_sh+=("--project-ref" "$project_ref")
    fi

    echo -e "${BOLD}Configuring your tools...${NC}\n"

    # --- Antigravity ---
    if [ "$use_antigravity" -eq 0 ]; then
        supabase_args_formatted=$(printf '        "%s"' "${supabase_args_sh[@]}" | sed 's/""$//' | tr '\0' '\n')
        args_block=""
        for arg in "${supabase_args_sh[@]}"; do
            args_block+="        \"$arg\","$'\n'
        done
        args_block="${args_block%,$'\n'}"

        cat > mcp.json << MCPEOF
{
  "_readme": "Antigravity: Chats → MCP Servers → Manage MCP Servers → View Raw Config → paste the mcpServers block below",
  "mcpServers": {
    "supabase-mcp-server": {
      "command": "$node_path",
      "args": [
$args_block
      ],
      "env": {
        "PATH": "/opt/homebrew/bin:/usr/local/bin:/usr/bin:/bin:/usr/sbin:/sbin"
      }
    },
    "github-mcp-server": {
      "command": "$node_path",
      "args": [
        "$npx_path",
        "-y",
        "@modelcontextprotocol/server-github"
      ],
      "env": {
        "GITHUB_PERSONAL_ACCESS_TOKEN": "$github_token",
        "PATH": "/opt/homebrew/bin:/usr/local/bin:/usr/bin:/bin:/usr/sbin:/sbin"
      }
    }
  }
}
MCPEOF
        echo -e "  ✅ ${GREEN}mcp.json created with your tokens${NC}"
        echo -e "     ${BOLD}Next:${NC} Antigravity → Chats → MCP Servers → Manage MCP Servers → View Raw Config"
        echo -e "     Paste the ${CYAN}mcpServers${NC} block from ${CYAN}mcp.json${NC}\n"
    fi

    # --- Claude Code ---
    if [ "$use_claude" -eq 0 ]; then
        if ! command -v claude &>/dev/null; then
            echo -e "  ${RED}❌ 'claude' CLI not found.${NC} Install it from ${CYAN}claude.ai/code${NC} first.\n"
        else
            supabase_json="{\"command\":\"$node_path\",\"args\":[$supabase_args_json],\"env\":{\"PATH\":\"/opt/homebrew/bin:/usr/local/bin:/usr/bin:/bin:/usr/sbin:/sbin\"}}"
            github_json="{\"command\":\"$node_path\",\"args\":[\"$npx_path\",\"-y\",\"@modelcontextprotocol/server-github\"],\"env\":{\"GITHUB_PERSONAL_ACCESS_TOKEN\":\"$github_token\",\"PATH\":\"/opt/homebrew/bin:/usr/local/bin:/usr/bin:/bin:/usr/sbin:/sbin\"}}"

            if claude mcp add-json supabase-mcp-server --scope user "$supabase_json" 2>/dev/null; then
                echo -e "  ✅ ${GREEN}Supabase MCP added to Claude Code${NC}"
            else
                echo -e "  ${RED}❌ Failed to add Supabase MCP to Claude Code${NC}"
            fi

            if claude mcp add-json github-mcp-server --scope user "$github_json" 2>/dev/null; then
                echo -e "  ✅ ${GREEN}GitHub MCP added to Claude Code${NC}"
            else
                echo -e "  ${RED}❌ Failed to add GitHub MCP to Claude Code${NC}"
            fi

            echo ""
            echo -e "  ${BOLD}Verify:${NC} ${CYAN}claude mcp list${NC}"
            echo -e "  Both servers should show ${GREEN}✓ Connected${NC}."
            echo -e "  If not, re-run ${CYAN}./guide.sh 3${NC} and check your tokens.\n"
        fi
    fi

    echo -e "${BOLD}MCP Management Commands:${NC}"
    echo -e "  ${CYAN}claude mcp list${NC}                        — see all connected MCPs + status"
    echo -e "  ${CYAN}claude mcp remove supabase-mcp-server${NC}  — remove Supabase MCP"
    echo -e "  ${CYAN}claude mcp remove github-mcp-server${NC}    — remove GitHub MCP"
    echo -e "  ${CYAN}./guide.sh 3${NC}                           — re-run this wizard to reconfigure\n"

    echo -e "${BOLD}One-time vibe check — paste this to your AI:${NC}\n"
    echo -e "  ${CYAN}\"Vibe Check: List all tables in my Supabase public schema,"
    echo -e "  check my current Git branch, and confirm the supabase/backups/"
    echo -e "  folder exists. Report what you find for each.\"${NC}\n"
    echo -e "${BOLD}Daily session starter — always paste this first:${NC}\n"
    echo -e "  ${CYAN}\"Read CLAUDE.md. Then run a vibe check: list all tables"
    echo -e "  in public schema, confirm src/types/supabase.ts is current,"
    echo -e "  show me the last supabase/backups/ snapshot date, and check"
    echo -e "  if there are any uncommitted changes.\"${NC}\n"
    echo -e "${BOLD}Additional reference:${NC}"
    echo -e "  ${CYAN}Read AGENTS.md${NC} before working with Claude Code.\n"
    echo -e "${BOLD}Automation commands:${NC}"
    echo -e "  ${GREEN}npm run update-types${NC}  — Syncs src/types/supabase.ts with live DB schema"
    echo -e "  ${GREEN}npm run checkpoint${NC}    — Snapshots DB schema to supabase/backups/\n"
    echo -e "📖 ${BLUE}docs/dannflow_docs/mcp-setup.md${NC}"
    step_footer
}

# Security — test account signup via Supabase API
test_auth_account() {
    show_header
    echo -e "${BOLD}🧪 Test Account — Signup via Terminal${NC}\n"

    # Load .env.local
    if [ ! -f .env.local ]; then
        echo -e "${RED}❌ .env.local not found. Run ./guide.sh 2 first.${NC}"
        step_footer; return
    fi

    local url key
    url=$(grep -E "^NEXT_PUBLIC_SUPABASE_URL=" .env.local | cut -d '=' -f2- | tr -d '"' | tr -d "'")
    key=$(grep -E "^NEXT_PUBLIC_SUPABASE_ANON_KEY=" .env.local | cut -d '=' -f2- | tr -d '"' | tr -d "'")

    if [ -z "$url" ] || [ -z "$key" ]; then
        echo -e "${RED}❌ Supabase credentials missing in .env.local. Fill them in first.${NC}"
        step_footer; return
    fi

    echo -e "Connected to: ${CYAN}$url${NC}\n"

    local sec_options=("Signup (create new account)" "Login (test existing account)")
    local sec_sel=0
    while true; do
        for i in "${!sec_options[@]}"; do
            [ "$i" -eq "$sec_sel" ] && echo -e "  ${GREEN}${BOLD}› ${sec_options[$i]}${NC}" || echo -e "    ${sec_options[$i]}"
        done
        IFS= read -rsn1 k < /dev/tty
        if [[ "$k" == $'\x1b' ]]; then
            read -rsn2 k < /dev/tty
            [[ "$k" == '[A' || "$k" == '[B' ]] && ((sec_sel = 1 - sec_sel))
        elif [[ "$k" == '' ]]; then break
        elif [[ "$k" == 'q' || "$k" == 'Q' ]]; then clear; exit 0
        fi
        printf "\033[2A\033[0J"
    done
    echo ""

    read -p "  Email: " test_email < /dev/tty
    read -sp "  Password: " test_pass < /dev/tty
    echo -e "\n"

    if [ -z "$test_email" ] || [ -z "$test_pass" ]; then
        echo -e "${RED}❌ Email and password are required.${NC}"
        step_footer; return
    fi

    local endpoint action
    if [ "$sec_sel" -eq 0 ]; then
        endpoint="$url/auth/v1/signup"
        action="Signup"
    else
        endpoint="$url/auth/v1/token?grant_type=password"
        action="Login"
    fi

    echo -e "  ${YELLOW}Running $action...${NC}\n"
    local response
    response=$(curl -s -X POST "$endpoint" \
        -H "apikey: $key" \
        -H "Content-Type: application/json" \
        -d "{\"email\":\"$test_email\",\"password\":\"$test_pass\"}")

    if echo "$response" | grep -q '"access_token"'; then
        echo -e "  ✅ ${GREEN}$action successful!${NC}"
        if [ "$sec_sel" -eq 0 ]; then
            echo -e "  📧 Check ${CYAN}$test_email${NC} for a confirmation email (if email confirm is ON)."
        else
            echo -e "  🔑 Got access token — auth is working correctly."
        fi
    elif echo "$response" | grep -q '"error"'; then
        local msg
        msg=$(echo "$response" | grep -o '"message":"[^"]*"' | cut -d'"' -f4)
        echo -e "  ${RED}❌ $action failed:${NC} $msg"
        echo -e "  Check your Supabase credentials and project settings."
    else
        echo -e "  ${RED}❌ Unexpected response:${NC}"
        echo "$response"
    fi
    echo ""
    step_footer
}

# Security Command
show_security() {
    local sec_options=("View instructions" "Setup Gmail SMTP" "Test account (signup/login)")
    local sec_sel=0

    while true; do
        show_header
        echo -e "${BOLD}🔒 Step 4 — Security & Gmail Notifications${NC}\n"
        echo -e "Password change re-auth, Gmail security alerts, and auth email setup.\n"
        echo -e "Use ${CYAN}↑ ↓${NC} to navigate  ${GREEN}Enter${NC} to select  ${YELLOW}g${NC} → menu  ${YELLOW}q${NC} → quit\n"
        for i in "${!sec_options[@]}"; do
            [ "$i" -eq "$sec_sel" ] && echo -e "  ${GREEN}${BOLD}› ${sec_options[$i]}${NC}" || echo -e "    ${sec_options[$i]}"
        done
        IFS= read -rsn1 key < /dev/tty
        if [[ "$key" == $'\x1b' ]]; then
            read -rsn2 key < /dev/tty
            case "$key" in
                '[A') ((sec_sel--)); [ "$sec_sel" -lt 0 ] && sec_sel=2 ;;
                '[B') ((sec_sel++)); [ "$sec_sel" -gt 2 ] && sec_sel=0 ;;
            esac
        elif [[ "$key" == '' ]]; then break
        elif [[ "$key" == 'g' || "$key" == 'G' ]]; then show_main; return
        elif [[ "$key" == 'q' || "$key" == 'Q' ]]; then clear; exit 0
        fi
    done

    # Test account
    if [ "$sec_sel" -eq 2 ]; then
        test_auth_account; return
    fi

    show_header

    # Gmail SMTP setup
    if [ "$sec_sel" -eq 1 ]; then
        echo -e "${BOLD}📧 Gmail SMTP Setup${NC}\n"
        echo -e "${BOLD}1. Create a Google App Password${NC}"
        echo -e "   - Go to ${CYAN}myaccount.google.com/security${NC}"
        echo -e "   - Enable ${YELLOW}2-Step Verification${NC} (required)"
        echo -e "   - Go to ${CYAN}myaccount.google.com/apppasswords${NC}"
        echo -e "   - App: ${YELLOW}Mail${NC} | Device: ${YELLOW}Other${NC} → name it 'Supabase'"
        echo -e "   - Copy the ${BOLD}16-character password${NC} generated\n"

        echo -e "${BOLD}2. Configure SMTP in Supabase${NC}"
        echo -e "   Go to ${CYAN}Authentication > Email > SMTP Settings${NC}:"
        echo -e "   - ${BOLD}Enable custom SMTP${NC} → ${GREEN}ON${NC}"
        echo -e "   - ${BOLD}Host${NC}:     ${YELLOW}smtp.gmail.com${NC}"
        echo -e "   - ${BOLD}Port${NC}:     ${YELLOW}465${NC}"
        echo -e "   - ${BOLD}User${NC}:     ${YELLOW}yourname@gmail.com${NC}"
        echo -e "   - ${BOLD}Password${NC}: ${YELLOW}the 16-char app password${NC} (NOT your Gmail password)\n"

        echo -e "${BOLD}3. Verify It Works${NC}"
        echo -e "   Go to ${CYAN}Authentication > Email > Email Templates${NC}"
        echo -e "   Click ${YELLOW}Send test email${NC} — should arrive in your inbox within seconds."
        echo -e "   If it doesn't arrive, double-check the 16-char password and port.\n"

        echo -e "📖 ${BLUE}docs/dannflow_docs/production-features.md#6-email-authentication-gmail-smtp${NC}"
        step_footer; return
    fi

    # Instructions
    echo -e "${BOLD}🔒 Security Notifications & Re-Auth${NC}\n"
    echo -e "DannFlow has a high-security password change flow: the user must verify"
    echo -e "their current password before any update is allowed. A Gmail notification"
    echo -e "is sent automatically on every successful password change.\n"
    echo -e "  ${YELLOW}⚠️  Requires:${NC} Gmail SMTP active (choose 'Setup Gmail SMTP' above)\n"

    echo -e "${BOLD}1. Enable Email Templates${NC}"
    echo -e "   Go to ${CYAN}Supabase → Authentication → Email → Email Templates${NC}:"
    echo -e "   ${GREEN}✓ Reset Password${NC}   — sends reset link via Gmail SMTP"
    echo -e "   ${GREEN}✓ Password Changed${NC} — security alert on every password update\n"

    echo -e "${BOLD}2. Email Provider Settings${NC}"
    echo -e "   Go to ${CYAN}Authentication → Providers → Email${NC}:"
    echo -e "   - ${BOLD}Enable Email Provider${NC} → ${GREEN}ON${NC}"
    echo -e "   - ${BOLD}Confirm Email${NC}         → ${GREEN}ON${NC} (verify email on signup)"
    echo -e "   - ${BOLD}Secure Email Change${NC}   → ${GREEN}ON${NC} (re-confirm on email change)\n"

    echo -e "${BOLD}3. How the Re-Auth Gate Works${NC}"
    echo -e "   ${CYAN}src/services/auth.ts → updatePassword()${NC}"
    echo -e "   1. User enters current password in the Security tab"
    echo -e "   2. Silent ${CYAN}signInWithPassword${NC} verifies identity"
    echo -e "   3. If correct → ${CYAN}updateUser${NC} sets the new password"
    echo -e "   4. Gmail sends 'Password Changed' alert to inbox"
    echo -e "   5. Wrong current password → error shown, no change made\n"

    echo -e "${BOLD}4. Test the Full Flow${NC}"
    echo -e "   Run ${CYAN}npm run dev${NC}, log in, go to Dashboard → Settings → Security tab."
    echo -e "   Or use ${GREEN}./guide.sh 4${NC} → ${GREEN}Test account${NC} to test auth in this terminal.\n"

    echo -e "📖 ${BLUE}docs/dannflow_docs/production-features.md#security-notifications${NC}"
    step_footer
}

# Ready Command
show_ready() {
    show_header
    echo -e "${BOLD}🚀 Ready for Launch? Checkbox:${NC}\n"
    
    echo -e " [ ] ${CYAN}Branding${NC}: App name and GitHub URLs set in .env.local"
    echo -e " [ ] ${CYAN}Auth Setup${NC}: Gmail SMTP and URL Configuration applied"
    echo -e " [ ] ${CYAN}Personalize${NC}: Updated siteConfig in ${CYAN}src/lib/config.ts${NC}"
    echo -e " [ ] ${CYAN}AI Sync${NC}: Supabase MCP connected for Vibe Coding"
    echo -e " [ ] ${CYAN}Snapshot${NC}: Ran 'npm run checkpoint' to save DB state\n"
    
    echo -e "Ready to start coding? Disconnect from the template and start your own legacy:\n"
    echo -e "👉 Run ${YELLOW}./guide.sh init${NC} (This will reset your Git history!)\n"
    
    echo -e "📖 Deployment and Next Steps: ${BLUE}docs/dannflow_docs/backups-and-sync.md${NC}"
    echo -e "Happy shipping! 🚢"
    step_footer
}

# Deploy Command
show_deploy() {
    show_header
    echo -e "${BOLD}🚀 Vercel Deployment Guide${NC}\n"
    echo -e "Ready to show the world? Follow these steps to deploy on Vercel:\n"
    
    echo -e "${BOLD}1. Push to GitHub${NC}"
    echo -e "   - Create a new repository on GitHub."
    echo -e "   - Push your code: ${CYAN}git remote add origin ... && git push -u origin main${NC}\n"
    
    echo -e "${BOLD}2. Import to Vercel${NC}"
    echo -e "   - Go to ${CYAN}vercel.com${NC} and import your repository."
    echo -e "   - Add all environment variables from your ${YELLOW}.env.local${NC}."
    
    echo -e "${BOLD}3. Supabase Redirects (CRITICAL)${NC}"
    echo -e "   - Once deployed, copy your Vercel URL (e.g., ${YELLOW}https://my-app.vercel.app${NC})."
    echo -e "   - Go to ${CYAN}Supabase > Auth > URL Configuration${NC}."
    echo -e "   - Add your Vercel URL to the ${BOLD}Redirect URLs${NC}.\n"
    
    echo -e "📖 Full Production Guide: ${BLUE}docs/dannflow_docs/production-features.md#7-vercel-deployment${NC}"
    step_footer
}

# Claude Code Setup Command
show_claude() {
    show_header
    echo -e "${BOLD}🤖 Set Up Your Claude Code Environment${NC}\n"
    echo -e "DannFlow ships with a full Claude Code setup: ${CYAN}CLAUDE.md${NC}, ${CYAN}SKILLS.md${NC},"
    echo -e "22 custom slash commands, Ruflo MCP tools, and 8 skill packs.\n"

    # ── New project flow ──────────────────────────────────────────────────────
    echo -e "${BOLD}━━━ New Project Setup (run once) ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}\n"

    echo -e "${BOLD}1. Edit README.md${NC}"
    echo -e "   Rewrite the intro to describe ${YELLOW}your${NC} project — not DannFlow."
    echo -e "   Update the feature table and project structure to match reality."
    echo -e "   ${YELLOW}Don't polish it.${NC} Claude reads it to understand what you're building.\n"

    echo -e "${BOLD}2. Run /init-claude in Claude Code${NC}"
    echo -e "   Reads README + package.json + src/ and tailors everything to your project:"
    echo -e "   - ${CYAN}CLAUDE.md${NC}        (Claude's project config)"
    echo -e "   - ${CYAN}SKILLS.md${NC}        (which skills are relevant)"
    echo -e "   - ${CYAN}.claude/commands/${NC} (command files updated to match your stack)\n"

    echo -e "${BOLD}3. Fill in PROJECT_CONTEXT.md${NC}"
    echo -e "   Created at your project root. Add your:"
    echo -e "   - Target audience + what they care about"
    echo -e "   - Stack decisions (e.g. 'Resend for email, not SendGrid')"
    echo -e "   - Design decisions (e.g. 'rounded-2xl, h-14 buttons')"
    echo -e "   - Anti-decisions (e.g. 'NOT adding Stripe yet')"
    echo -e "   Skills and commands read this file — no skill editing needed.\n"

    echo -e "${BOLD}4. Run /ruflo-upgrade in Claude Code${NC}"
    echo -e "   Adds memory + parallel-agent patterns to your 12 core commands.\n"

    echo -e "${BOLD}5. Run /no-conflict in Claude Code${NC}"
    echo -e "   Verifies docs and code are in sync. Fix any drift before building.\n"

    echo -e "${GREEN}✅ Setup complete. Start with: ${CYAN}/ask-command <what you want to build>${NC}\n"

    # ── After an update ───────────────────────────────────────────────────────
    echo -e "${BOLD}━━━ After Running /init-update ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}\n"
    echo -e "   ${CYAN}/ruflo-upgrade${NC}   Restore memory + parallel patterns (may have been overwritten)"
    echo -e "   ${CYAN}/no-conflict${NC}     Verify no documentation drift from the update\n"

    # ── Old / existing project ────────────────────────────────────────────────
    echo -e "${BOLD}━━━ Existing Project (no DannFlow tooling yet) ━━━━━━━━━━━━━━━━━${NC}\n"
    echo -e "   Run this from your project root to install all Claude tooling"
    echo -e "   without touching ${YELLOW}src/${NC}, ${YELLOW}package.json${NC}, or your database:\n"
    echo -e "   ${CYAN}curl -sSL https://raw.githubusercontent.com/Danncode10/DannFlow/main/install-add.sh | bash${NC}\n"
    echo -e "   Then follow the 5 steps above (edit README → /init-claude → etc.)\n"

    # ── Daily workflow ────────────────────────────────────────────────────────
    echo -e "${BOLD}━━━ Daily Workflow ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}\n"
    echo -e "   ${CYAN}/checkpoint${NC}    Snapshot DB before risky schema changes"
    echo -e "   ${CYAN}/sync-types${NC}    After any schema change"
    echo -e "   ${CYAN}/new-feature${NC}   Scaffold service + types + page + form (uses swarms)"
    echo -e "   ${CYAN}/ui${NC}            Make code fully responsive (active rewrite)"
    echo -e "   ${CYAN}/review${NC}        Pre-PR lint + typecheck + guardrail check"
    echo -e "   ${CYAN}/commit${NC}        Stage + draft conventional commit\n"

    echo -e "${BOLD}Session starter — always paste this first:${NC}\n"
    echo -e "${CYAN}──────────────────────────────────────────────────${NC}"
    echo -e "Read CLAUDE.md and PROJECT_CONTEXT.md before doing"
    echo -e "anything. Confirm my Supabase MCP is connected by"
    echo -e "listing all tables in the public schema, and check that"
    echo -e "src/types/supabase.ts is up to date with the live schema."
    echo -e "${CYAN}──────────────────────────────────────────────────${NC}\n"

    echo -e "Full daily loop: ${CYAN}./guide.sh workflow${NC}"
    echo -e "Health check: ${CYAN}./guide.sh vibe-check${NC}"
    echo -e "Refresh skill packs: ${CYAN}./guide.sh skills-update${NC}\n"

    echo -e "📖 Setup flows: ${BLUE}docs/dannflow_docs/setup-flow.md${NC}"
    echo -e "📖 Commands reference: ${BLUE}docs/dannflow_docs/claude-workflow.md${NC}"
    step_footer
}

# Skill updater — pulls latest from all installed packs (taste + quality)
show_taste() {
    show_header
    echo -e "${BOLD}🎨 Update Skill Packs${NC}\n"
    echo -e "Fetching the latest skill definitions from upstream packs.\n"
    echo -e "${BOLD}Design taste:${NC}"
    echo -e "  ${CYAN}1.${NC} Leonxlnx/taste-skill    — 12 broad design-taste skills"
    echo -e "  ${CYAN}2.${NC} emilkowalski/skill      — Emil Kowalski's animation/UI craft"
    echo -e "  ${CYAN}3.${NC} pbakaus/impeccable      — anti-pattern detector + vocabulary"
    echo -e "${BOLD}Quality:${NC}"
    echo -e "  ${CYAN}4.${NC} anthropics/skills       — claude-api (SDK + prompt caching)"
    echo -e "  ${CYAN}5.${NC} shadcn/ui               — official shadcn component guidance"
    echo -e "  ${CYAN}6.${NC} alirezarezvani/claude-skills — a11y-audit (WCAG 2.2 A/AA)"
    echo -e "${BOLD}SEO + Marketing:${NC}"
    echo -e "  ${CYAN}7.${NC} coreyhaines31/marketingskills — 30+ growth skills (SEO, copy, CRO, launch…)"
    echo -e "  ${CYAN}8.${NC} addyosmani/web-quality-skills — technical SEO + Core Web Vitals\n"
    echo -e "Idempotent — re-running pulls the freshest versions."
    echo -e "Skills land in ${CYAN}.agents/skills/${NC} and are symlinked into ${CYAN}.claude/skills/${NC}.\n"

    if ! command -v npx >/dev/null 2>&1; then
        echo -e "❌ ${RED}npx not found. Install Node.js first.${NC}\n"
        step_footer
        return
    fi

    local fail=0

    echo -e "${CYAN}→ Leonxlnx/taste-skill${NC}"
    npx -y skills add https://github.com/Leonxlnx/taste-skill --all || fail=1

    echo -e "\n${CYAN}→ emilkowalski/skill${NC}"
    npx -y skills add https://github.com/emilkowalski/skill --all || fail=1

    echo -e "\n${CYAN}→ pbakaus/impeccable${NC}"
    npx -y skills add https://github.com/pbakaus/impeccable --all || fail=1

    echo -e "\n${CYAN}→ anthropics/skills@claude-api${NC}"
    npx -y skills add anthropics/skills@claude-api -y || fail=1

    echo -e "\n${CYAN}→ shadcn/ui@shadcn${NC}"
    npx -y skills add shadcn/ui@shadcn -y || fail=1

    echo -e "\n${CYAN}→ alirezarezvani/claude-skills@a11y-audit${NC}"
    npx -y skills add alirezarezvani/claude-skills@a11y-audit -y || fail=1

    echo -e "\n${CYAN}→ coreyhaines31/marketingskills${NC}"
    npx -y skills add coreyhaines31/marketingskills --all || fail=1

    echo -e "\n${CYAN}→ addyosmani/web-quality-skills@seo${NC}"
    npx -y skills add addyosmani/web-quality-skills@seo -y || fail=1

    if [ "$fail" -eq 0 ]; then
        echo -e "\n${GREEN}${BOLD}✓ All eight skill packs updated.${NC}"
        echo -e "See ${BLUE}SKILLS.md${NC} for which skills to invoke and when.\n"
    else
        echo -e "\n${YELLOW}⚠️  One or more packs failed to update. Check the logs above and your network.${NC}\n"
    fi
    step_footer
}

# Commands Listing — dynamically reads .claude/commands/*.md, grouped by category
show_commands() {
    show_header
    echo -e "${BOLD}🤖 Claude Code Slash Commands${NC}\n"

    local commands_dir=".claude/commands"
    if [ ! -d "$commands_dir" ]; then
        echo -e "${RED}No .claude/commands/ directory found.${NC}"
        echo -e "Run ${CYAN}./guide.sh claude${NC} to set up the Claude environment.\n"
        step_footer
        return
    fi

    # Category for a command — returns "sortKey|emoji label"
    get_category() {
        case "$1" in
            ask-command|init-claude|make-command) echo "1|🚀 Discovery & setup" ;;
            security-audit|rls-check|rls|ui|review) echo "2|🛡️  Security & quality" ;;
            checkpoint|sync-types|explain-schema|migrate|seed) echo "3|🗄️  Supabase workflow" ;;
            new-feature|new-page|masterplan-task) echo "4|🧱 Scaffolding" ;;
            seo-check|seo-fix|marketing-check) echo "5|📈 SEO & marketing" ;;
            sync-upstream|sync-to-upstream) echo "7|🔄 Upstream sync" ;;
            commit|cleanup|sync-commands|auto-docs|no-conflict|init-update|ruflo-upgrade) echo "6|🧹 Housekeeping" ;;
            *) echo "9|📦 Other" ;;
        esac
    }

    # Terminal width — capped between 80 and 140
    local term_width
    term_width=$(tput cols 2>/dev/null || echo 100)
    [ "$term_width" -lt 80 ] && term_width=80
    [ "$term_width" -gt 140 ] && term_width=140

    # Column widths: 2 padding + lw + 3 separator (" │ ") + rw + 2 padding = term_width
    # So lw + rw = term_width - 7
    local lw=32
    local rw=$(( term_width - lw - 7 ))
    local total_inner=$(( lw + rw + 3 ))   # inner width between │ │

    # Build horizontal lines once
    local h_top h_mid h_bot h_full
    h_top=$(printf '─%.0s' $(seq 1 $(( lw + 2 )) ))
    h_top="┌${h_top}┬$(printf '─%.0s' $(seq 1 $(( rw + 2 )) ))┐"
    h_bot=$(printf '─%.0s' $(seq 1 $(( lw + 2 )) ))
    h_bot="└${h_bot}┴$(printf '─%.0s' $(seq 1 $(( rw + 2 )) ))┘"
    h_full=$(printf '─%.0s' $(seq 1 $(( total_inner + 2 )) ))
    h_mid="├$(printf '─%.0s' $(seq 1 $(( lw + 2 )) ))┼$(printf '─%.0s' $(seq 1 $(( rw + 2 )) ))┤"
    local h_split="├${h_full}┤"

    # Word-wrap text to N chars per line via fold; outputs lines on stdout
    wrap_text() {
        local text="$1" width="$2"
        if [ -z "$text" ]; then
            echo ""
            return
        fi
        echo "$text" | fold -s -w "$width"
    }

    # Pad a string to exactly N chars (right-pad with spaces). Assumes ASCII.
    pad_right() {
        printf "%-${2}s" "$1"
    }

    # Print a 2-column row: left + right, both wrapped to fit
    print_row() {
        local left="$1" right="$2"
        local left_lines=() right_lines=()
        while IFS= read -r line; do left_lines+=("$line"); done < <(wrap_text "$left" "$lw")
        while IFS= read -r line; do right_lines+=("$line"); done < <(wrap_text "$right" "$rw")

        local lcount=${#left_lines[@]} rcount=${#right_lines[@]}
        local max=$(( lcount > rcount ? lcount : rcount ))

        local i
        for (( i=0; i<max; i++ )); do
            local l="${left_lines[$i]:-}" r="${right_lines[$i]:-}"
            local padded_l padded_r
            padded_l=$(pad_right "$l" "$lw")
            padded_r=$(pad_right "$r" "$rw")
            # Color only the left cell (command name)
            if [ "$i" -eq 0 ] && [ -n "$l" ]; then
                echo -e "${CYAN}│${NC} ${CYAN}${BOLD}${padded_l}${NC} ${CYAN}│${NC} ${padded_r} ${CYAN}│${NC}"
            else
                echo -e "${CYAN}│${NC} ${CYAN}${padded_l}${NC} ${CYAN}│${NC} ${padded_r} ${CYAN}│${NC}"
            fi
        done
    }

    # Print a section header row (single cell spanning both columns)
    print_section_header() {
        local label="$1"
        local padded
        padded=$(pad_right " $label" "$total_inner")
        echo -e "${CYAN}│${NC}${BOLD}${padded}${NC}${CYAN}│${NC}"
    }

    # Collect commands → "sortKey|category|name|desc|hint"
    local total_count=0
    local cmd_list=""
    for file in "$commands_dir"/*.md; do
        [ -e "$file" ] || continue
        local name
        name=$(basename "$file" .md)
        [ "$name" = "README" ] && continue

        local description argument_hint
        description=$(awk '/^---$/{f=!f; next} f && /^description:/{sub(/^description:[ ]*/, ""); print; exit}' "$file")
        argument_hint=$(awk '/^---$/{f=!f; next} f && /^argument-hint:/{sub(/^argument-hint:[ ]*/, ""); print; exit}' "$file")

        local cat_full sort_key cat_label
        cat_full=$(get_category "$name")
        sort_key="${cat_full%%|*}"
        cat_label="${cat_full#*|}"

        cmd_list="${cmd_list}${sort_key}|${cat_label}|${name}|${description}|${argument_hint}"$'\n'
        total_count=$((total_count + 1))
    done

    # Sort by category sort_key (numeric), then by command name
    local sorted
    sorted=$(echo "$cmd_list" | sort -t'|' -k1,1n -k3,3)

    # Group commands by category, render one bordered table per section
    local prev_cat=""
    local pending_rows=""
    local pending_label=""

    flush_table() {
        [ -z "$pending_label" ] && return
        echo -e "${CYAN}${h_top}${NC}"
        print_section_header "$pending_label"
        echo -e "${CYAN}${h_mid}${NC}"
        # Print all rows for this section, separated by mid lines
        local first=1
        while IFS=$'\x1f' read -r left right; do
            [ -z "$left$right" ] && continue
            if [ "$first" -eq 0 ]; then
                echo -e "${CYAN}${h_mid}${NC}"
            fi
            print_row "$left" "$right"
            first=0
        done <<< "$pending_rows"
        echo -e "${CYAN}${h_bot}${NC}"
        echo ""
        pending_rows=""
        pending_label=""
    }

    while IFS='|' read -r sort_key cat name desc hint; do
        [ -z "$cat" ] && continue

        if [ "$cat" != "$prev_cat" ]; then
            flush_table
            pending_label="$cat"
            prev_cat="$cat"
        fi

        # Build left cell: command + optional hint
        local left="/$name"
        [ -n "$hint" ] && left="$left $hint"

        # Build right cell: description (or empty)
        local right="${desc:-—}"

        # Use \x1f as field sep so it can't appear in cell text
        pending_rows="${pending_rows}${left}"$'\x1f'"${right}"$'\n'
    done <<< "$sorted"
    flush_table

    # Footer summary box
    local footer_text="  ${total_count} commands available  •  Type /<command-name> in Claude Code  •  /ask-command routes you to the right one"
    echo -e "${CYAN}╭${h_full}╮${NC}"
    echo -e "${CYAN}│${NC}${BOLD}$(pad_right "$footer_text" "$total_inner")${NC}${CYAN}│${NC}"
    echo -e "${CYAN}╰${h_full}╯${NC}\n"

    echo -e "📖 Full reference: ${BLUE}docs/dannflow_docs/claude-workflow.md${NC}"
    echo -e "${CYAN}💡 Tip:${NC} Run ${CYAN}./guide.sh ruflo-commands${NC} to see Ruflo MCP tools (invoked by Claude, not typed as slash commands)\n"
    step_footer
}

show_ruflo_commands() {
    show_header
    echo -e "${BOLD}🧠 Ruflo MCP Tools${NC}"
    echo -e "${CYAN}(Intelligent agent coordination, memory, and automation)${NC}\n"
    echo -e "${YELLOW}⚠️  These are MCP tools, NOT slash commands.${NC}"
    echo -e "   You don't type them. Ask Claude in plain English"
    echo -e "   (e.g. ${CYAN}\"save this to ruflo memory\"${NC} or ${CYAN}\"search ruflo for X\"${NC})"
    echo -e "   and Claude invokes the tool (real name: ${CYAN}mcp__ruflo__<tool>${NC}).\n"

    # Terminal width — capped between 80 and 140
    local term_width
    term_width=$(tput cols 2>/dev/null || echo 100)
    [ "$term_width" -lt 80 ] && term_width=80
    [ "$term_width" -gt 140 ] && term_width=140

    # Column widths
    local lw=32
    local rw=$(( term_width - lw - 7 ))
    local total_inner=$(( lw + rw + 3 ))

    # Build horizontal lines
    local h_top h_mid h_bot h_full
    h_top=$(printf '─%.0s' $(seq 1 $(( lw + 2 )) ))
    h_top="┌${h_top}┬$(printf '─%.0s' $(seq 1 $(( rw + 2 )) ))┐"
    h_bot=$(printf '─%.0s' $(seq 1 $(( lw + 2 )) ))
    h_bot="└${h_bot}┴$(printf '─%.0s' $(seq 1 $(( rw + 2 )) ))┘"
    h_full=$(printf '─%.0s' $(seq 1 $(( total_inner + 2 )) ))
    h_mid="├$(printf '─%.0s' $(seq 1 $(( lw + 2 )) ))┼$(printf '─%.0s' $(seq 1 $(( rw + 2 )) ))┤"

    # Word-wrap and padding helpers
    wrap_text() {
        local text="$1" width="$2"
        [ -z "$text" ] && echo "" && return
        echo "$text" | fold -s -w "$width"
    }

    pad_right() {
        printf "%-${2}s" "$1"
    }

    print_row() {
        local left="$1" right="$2"
        local left_lines right_lines
        left_lines=$(wrap_text "$left" "$lw")
        right_lines=$(wrap_text "$right" "$rw")
        local lcount=$(echo "$left_lines" | wc -l)
        local rcount=$(echo "$right_lines" | wc -l)
        [ "$lcount" -eq 0 ] && lcount=1
        [ "$rcount" -eq 0 ] && rcount=1
        local max=$(( lcount > rcount ? lcount : rcount ))
        local i j=1
        while [ $j -le $max ]; do
            local l=$(echo "$left_lines" | sed -n "${j}p")
            local r=$(echo "$right_lines" | sed -n "${j}p")
            local padded_l padded_r
            padded_l=$(pad_right "$l" "$lw")
            padded_r=$(pad_right "$r" "$rw")
            if [ "$j" -eq 1 ] && [ -n "$l" ]; then
                echo -e "${CYAN}│${NC} ${CYAN}${BOLD}${padded_l}${NC} ${CYAN}│${NC} ${padded_r} ${CYAN}│${NC}"
            else
                echo -e "${CYAN}│${NC} ${CYAN}${padded_l}${NC} ${CYAN}│${NC} ${padded_r} ${CYAN}│${NC}"
            fi
            j=$((j + 1))
        done
    }

    print_section_header() {
        local label="$1"
        local padded
        padded=$(pad_right " $label" "$total_inner")
        echo -e "${CYAN}│${NC}${BOLD}${padded}${NC}${CYAN}│${NC}"
    }

    # Ruflo commands: category|name|description
    local ruflo_data="🧠 Memory|memory-store|Persistent key-value store. Save decisions, patterns, configurations across sessions.
🧠 Memory|memory-search|Semantic search across stored memories. Find conceptually-related entries by meaning.
🧠 Memory|memory-retrieve|Read back a specific stored memory by exact key.
👥 Agents|agent-spawn|Spawn a tracked agent with cost attribution and swarm coordination.
👥 Agents|agent-list|List all active agents with their status and task count.
👥 Agents|agent-status|Get lifecycle state of a single agent.
🐝 Swarms|swarm-init|Initialize a swarm with persistent state tracking.
🐝 Swarms|swarm-status|Get swarm status from persistent state.
🐝 Swarms|swarm-health|Check swarm health status with real state inspection.
⚙️  Hooks|hooks-route|Intelligent model routing (haiku/sonnet/opus) based on task complexity.
⚙️  Hooks|hooks-pre-task|Get context and agent suggestions before starting a task.
⚙️  Hooks|hooks-post-task|Record task completion for cross-session learning.
💾 Sessions|session-save|Save current session state for persistence.
💾 Sessions|session-restore|Restore a previous session with agents, tasks, and memory.
💾 Sessions|session-list|List all saved sessions.
🔗 Coordination|coordination-consensus|Manage consensus protocol with BFT, Raft, or Quorum.
🔗 Coordination|coordination-orchestrate|Orchestrate multi-agent coordination across parallel tasks.
🔗 Coordination|coordination-sync|Synchronize state across nodes.
📊 Embeddings|embeddings-generate|Generate embeddings for text (Euclidean or hyperbolic).
📊 Embeddings|embeddings-search|Semantic search across stored embeddings.
📊 Embeddings|embeddings-init|Initialize ONNX embedding subsystem.
⚡ Workflows|workflow-create|Create a workflow with step dependencies and execution strategies.
⚡ Workflows|workflow-execute|Execute a workflow with optional variable injection.
⚡ Workflows|workflow-validate|Structurally validate a workflow definition file."

    local prev_cat="" total_count=0
    while IFS='|' read -r category name description; do
        [ -z "$category" ] && continue

        if [ "$category" != "$prev_cat" ]; then
            [ -n "$prev_cat" ] && echo -e "${CYAN}${h_bot}${NC}\n"
            echo -e "${CYAN}${h_top}${NC}"
            print_section_header "$category"
            echo -e "${CYAN}${h_mid}${NC}"
            prev_cat="$category"
            first=1
        else
            echo -e "${CYAN}${h_mid}${NC}"
        fi

        print_row "$name" "$description"
        total_count=$((total_count + 1))
    done <<< "$ruflo_data"
    echo -e "${CYAN}${h_bot}${NC}\n"

    # Footer
    local footer_text="  ${total_count} Ruflo MCP tools available  •  Invoked by Claude, not typed  •  Ask in natural language"
    echo -e "${CYAN}╭${h_full}╮${NC}"
    echo -e "${CYAN}│${NC}${BOLD}$(pad_right "$footer_text" "$total_inner")${NC}${CYAN}│${NC}"
    echo -e "${CYAN}╰${h_full}╯${NC}\n"

    echo -e "📖 Full Ruflo docs: ${BLUE}https://github.com/anthropics/claude-code-docs${NC}"
    echo -e "   Install: ${CYAN}npm install -g ruflo@latest${NC}\n"
    step_footer
}

# UI helpers
hex_to_rgb() {
    local hex="${1#'#'}"
    echo "$((16#${hex:0:2})) $((16#${hex:2:2})) $((16#${hex:4:2}))"
}

color_swatch() {
    local hex="$1" label="$2"
    local rgb r g b
    rgb=$(hex_to_rgb "$hex")
    read -r r g b <<< "$rgb"
    printf "  \033[48;2;%d;%d;%dm     \033[0m  %s  %s\n" "$r" "$g" "$b" "$hex" "$label"
}

read_css_token() {
    local token="$1"
    grep -E "^\s*${token}:" src/app/globals.css 2>/dev/null \
        | head -1 | sed 's/.*: *//;s/;.*//' | tr -d ' '
}

write_css_token() {
    local token="$1" value="$2"
    sed -i.bak "s|^\( *\)${token}:.*|\1${token}: ${value};|" src/app/globals.css
    rm -f src/app/globals.css.bak
}

# UI Command
show_ui() {
    local ui_options=("Ask AI for colors" "Setup UI colors" "See current colors" "Reset to DannFlow defaults")
    local ui_sel=0

    while true; do
        show_header
        echo -e "${BOLD}🎨 Step 5 — Brand Theme & Colors${NC}\n"
        echo -e "DannFlow uses Tailwind v4 CSS variables in ${CYAN}src/app/globals.css${NC}.\n"
        echo -e "Use ${CYAN}↑ ↓${NC} to navigate  ${GREEN}Enter${NC} to select  ${YELLOW}g${NC} → menu  ${YELLOW}q${NC} → quit\n"
        for i in "${!ui_options[@]}"; do
            [ "$i" -eq "$ui_sel" ] && echo -e "  ${GREEN}${BOLD}› ${ui_options[$i]}${NC}" || echo -e "    ${ui_options[$i]}"
        done
        IFS= read -rsn1 key < /dev/tty
        if [[ "$key" == $'\x1b' ]]; then
            read -rsn2 key < /dev/tty
            case "$key" in
                '[A') ((ui_sel--)); [ "$ui_sel" -lt 0 ] && ui_sel=3 ;;
                '[B') ((ui_sel++)); [ "$ui_sel" -gt 3 ] && ui_sel=0 ;;
            esac
        elif [[ "$key" == '' ]]; then break
        elif [[ "$key" == 'g' || "$key" == 'G' ]]; then show_main; return
        elif [[ "$key" == 'q' || "$key" == 'Q' ]]; then clear; exit 0
        fi
    done

    # --- Ask AI for colors ---
    if [ "$ui_sel" -eq 0 ]; then
        show_header
        echo -e "${BOLD}🤖 Ask AI for Color Suggestions${NC}\n"

        # Read project context
        local app_name description
        app_name=$(grep '"name"' package.json 2>/dev/null | head -1 | sed 's/.*"name": *"//;s/".*//')
        [ -z "$app_name" ] && app_name="my app"
        description=$(grep -A2 "^#" README.md 2>/dev/null | head -6 | tr '\n' ' ' | sed 's/[#*`]//g' | cut -c1-300)
        [ -z "$description" ] && description="a Next.js SaaS starter application"

        echo -e "Project: ${CYAN}$app_name${NC}"
        echo -e "Context: ${YELLOW}$description${NC}\n"

        local ai_prompt="You are a UI/brand designer. Based on this project: \"$app_name — $description\", suggest a complete color theme for a modern web app. Return ONLY these 13 lines with no extra text or explanation:\nPRIMARY: #hexcode\nPRIMARY_FOREGROUND: #hexcode\nBACKGROUND: #hexcode\nFOREGROUND: #hexcode\nCARD: #hexcode\nCARD_FOREGROUND: #hexcode\nMUTED: #hexcode\nMUTED_FOREGROUND: #hexcode\nSECONDARY: #hexcode\nSECONDARY_FOREGROUND: #hexcode\nACCENT: #hexcode\nACCENT_FOREGROUND: #hexcode\nBORDER: #hexcode"

        # Tool picker
        local tool_opts=("Claude Code (auto-runs & applies)" "Antigravity (copy prompt to chat)")
        local tool_sel=0
        echo -e "Where should I ask?\n"
        while true; do
            for i in "${!tool_opts[@]}"; do
                [ "$i" -eq "$tool_sel" ] && echo -e "  ${GREEN}${BOLD}› ${tool_opts[$i]}${NC}" || echo -e "    ${tool_opts[$i]}"
            done
            IFS= read -rsn1 k < /dev/tty
            if [[ "$k" == $'\x1b' ]]; then
                read -rsn2 k < /dev/tty
                [[ "$k" == '[A' || "$k" == '[B' ]] && ((tool_sel = 1 - tool_sel))
            elif [[ "$k" == '' ]]; then break
            elif [[ "$k" == 'q' || "$k" == 'Q' ]]; then clear; exit 0
            fi
            printf "\033[2A\033[0J"
        done
        echo ""

        # Antigravity: show prompt to copy
        if [ "$tool_sel" -eq 1 ]; then
            echo -e "${BOLD}Copy this prompt into Antigravity chat:${NC}\n"
            echo -e "${CYAN}──────────────────────────────────────────────────${NC}"
            echo -e "$ai_prompt"
            echo -e "${CYAN}──────────────────────────────────────────────────${NC}\n"
            echo -e "When the AI replies, come back and use ${GREEN}Setup UI colors${NC}"
            echo -e "to enter the hex codes manually with live swatches.\n"
            step_footer; return
        fi

        # Claude Code: run automatically
        if ! command -v claude &>/dev/null; then
            echo -e "${RED}❌ 'claude' CLI not found.${NC} Install from ${CYAN}claude.ai/code${NC}\n"
            step_footer; return
        fi

        echo -e "${YELLOW}Asking Claude for color suggestions...${NC}\n"
        local response
        response=$(claude -p "$ai_prompt" 2>/dev/null)

        if [ -z "$response" ]; then
            echo -e "${RED}❌ No response from Claude. Check your connection.${NC}\n"
            step_footer; return
        fi

        echo -e "${BOLD}Claude suggests:${NC}\n"

        local suggest_labels=("PRIMARY" "PRIMARY_FOREGROUND" "BACKGROUND" "FOREGROUND" "CARD" "CARD_FOREGROUND" "MUTED" "MUTED_FOREGROUND" "SECONDARY" "SECONDARY_FOREGROUND" "ACCENT" "ACCENT_FOREGROUND" "BORDER")
        local css_tokens=("--color-primary" "--color-primary-foreground" "--color-background" "--color-foreground" "--color-card" "--color-card-foreground" "--color-muted" "--color-muted-foreground" "--color-secondary" "--color-secondary-foreground" "--color-accent" "--color-accent-foreground" "--color-border")
        local suggested_vals=()
        local valid=0

        for label in "${suggest_labels[@]}"; do
            local val
            val=$(echo "$response" | grep -i "^${label}:" | head -1 | sed 's/.*: *//' | tr -d ' \r\n')
            [[ "$val" != \#* ]] && val="#$val"
            if [[ "$val" =~ ^#[0-9a-fA-F]{6}$ ]]; then
                suggested_vals+=("$val")
                color_swatch "$val" "$label"
                valid=1
            else
                suggested_vals+=("")
                echo -e "  ${YELLOW}⚠️  $label: could not parse${NC}"
            fi
        done
        echo ""

        if [ "$valid" -eq 0 ]; then
            echo -e "${RED}❌ Could not parse any colors from Claude's response.${NC}\n"
            echo -e "Raw response:\n$response\n"
            step_footer; return
        fi

        ask_yes_no "Apply these colors to src/app/globals.css?"
        if [ "$?" -eq 0 ]; then
            for i in "${!css_tokens[@]}"; do
                [ -n "${suggested_vals[$i]}" ] && write_css_token "${css_tokens[$i]}" "${suggested_vals[$i]}"
            done
            echo -e "\n  ✅ ${GREEN}Colors applied!${NC} Run ${CYAN}npm run dev${NC} to preview your new theme.\n"
        else
            echo -e "  ${YELLOW}Cancelled — nothing written.${NC}\n"
        fi
        step_footer; return
    fi

    # --- See current colors (interactive picker) ---
    if [ "$ui_sel" -eq 2 ]; then
        local cur_tokens=(
            "--color-primary:Primary (brand color — buttons, links)"
            "--color-primary-foreground:Primary foreground (text on primary)"
            "--color-background:Page background"
            "--color-foreground:Body text"
            "--color-card:Card / panel background"
            "--color-card-foreground:Card text"
            "--color-muted:Muted background (subtle areas)"
            "--color-muted-foreground:Muted text (secondary labels)"
            "--color-secondary:Secondary background (chips, badges)"
            "--color-secondary-foreground:Secondary text"
            "--color-accent:Accent / hover highlight"
            "--color-accent-foreground:Accent text"
            "--color-border:Borders and dividers"
            "--color-destructive:Error / delete color"
            "--color-ring:Focus ring"
        )
        local cur_sel=0
        local cur_count=${#cur_tokens[@]}

        while true; do
            show_header
            echo -e "${BOLD}🎨 Current Theme Colors${NC}\n"
            echo -e "From ${CYAN}src/app/globals.css${NC}  —  ${CYAN}↑ ↓${NC} navigate  ${GREEN}Enter${NC} to edit  ${YELLOW}g${NC} → menu  ${YELLOW}q${NC} → quit\n"
            for i in "${!cur_tokens[@]}"; do
                local entry="${cur_tokens[$i]}"
                local ctoken="${entry%%:*}"
                local clabel="${entry#*:}"
                local cval
                cval=$(read_css_token "$ctoken")
                local swatch_str
                if [[ "$cval" =~ ^#[0-9a-fA-F]{6}$ ]]; then
                    local cr=$((16#${cval:1:2}))
                    local cg=$((16#${cval:3:2}))
                    local cb=$((16#${cval:5:2}))
                    swatch_str="\033[48;2;${cr};${cg};${cb}m   \033[0m ${cval}"
                else
                    swatch_str="${cval}"
                fi
                if [ "$i" -eq "$cur_sel" ]; then
                    echo -e "  ${GREEN}${BOLD}› ${swatch_str}  ${clabel}${NC}"
                else
                    echo -e "    ${swatch_str}  ${clabel}"
                fi
            done
            echo ""
            IFS= read -rsn1 ckey < /dev/tty
            if [[ "$ckey" == $'\x1b' ]]; then
                read -rsn2 ckey < /dev/tty
                case "$ckey" in
                    '[A') ((cur_sel--)); [ "$cur_sel" -lt 0 ] && cur_sel=$((cur_count - 1)) ;;
                    '[B') ((cur_sel++)); [ "$cur_sel" -ge "$cur_count" ] && cur_sel=0 ;;
                esac
            elif [[ "$ckey" == '' ]]; then
                local eentry="${cur_tokens[$cur_sel]}"
                local etoken="${eentry%%:*}"
                local elabel="${eentry#*:}"
                local ecurrent
                ecurrent=$(read_css_token "$etoken")
                echo -e "${BOLD}Editing: ${CYAN}$elabel${NC}"
                [[ "$ecurrent" =~ ^#[0-9a-fA-F]{6}$ ]] && color_swatch "$ecurrent" "current"
                while true; do
                    printf "New hex (e.g. #16a34a) or blank to cancel: "
                    IFS= read -r einput < /dev/tty
                    einput=$(echo "$einput" | tr -d ' ')
                    [[ -z "$einput" ]] && break
                    [[ "$einput" != \#* ]] && einput="#$einput"
                    if [[ "$einput" =~ ^#[0-9a-fA-F]{6}$ ]]; then
                        color_swatch "$einput" "→ will be set"
                        ask_yes_no "Apply $einput to $etoken?"
                        if [ "$?" -eq 0 ]; then
                            write_css_token "$etoken" "$einput"
                            echo -e "  ✅ ${GREEN}Updated!${NC}\n"
                        else
                            echo -e "  ${YELLOW}Cancelled.${NC}\n"
                        fi
                        break
                    else
                        echo -e "  ${RED}Invalid hex. Use format #rrggbb${NC}"
                    fi
                done
            elif [[ "$ckey" == 'g' || "$ckey" == 'G' ]]; then show_main; return
            elif [[ "$ckey" == 'q' || "$ckey" == 'Q' ]]; then clear; exit 0
            fi
        done
        return
    fi

    # --- Reset to defaults ---
    if [ "$ui_sel" -eq 3 ]; then
        show_header
        echo -e "${BOLD}🔄 Reset to DannFlow Defaults${NC}\n"
        ask_yes_no "This will overwrite your current theme. Continue?"
        if [ "$?" -eq 0 ]; then
            write_css_token "--color-primary" "#6C47FF"
            write_css_token "--color-primary-foreground" "#ffffff"
            write_css_token "--color-background" "#0A0A0F"
            write_css_token "--color-foreground" "#F0EEFF"
            write_css_token "--color-card" "#13131F"
            write_css_token "--color-card-foreground" "#F0EEFF"
            write_css_token "--color-muted" "#1A1A2E"
            write_css_token "--color-muted-foreground" "#9490B5"
            write_css_token "--color-secondary" "#1A1A2E"
            write_css_token "--color-secondary-foreground" "#F0EEFF"
            write_css_token "--color-accent" "#1E1640"
            write_css_token "--color-accent-foreground" "#F0EEFF"
            write_css_token "--color-border" "#2E2A4A"
            write_css_token "--color-destructive" "#ef4444"
            write_css_token "--color-destructive-foreground" "#ffffff"
            write_css_token "--color-input" "#2E2A4A"
            write_css_token "--color-ring" "#6C47FF"
            write_css_token "--color-popover" "#13131F"
            write_css_token "--color-popover-foreground" "#F0EEFF"
            echo -e "  ✅ ${GREEN}Reset to DannFlow defaults.${NC}\n"
            color_swatch "#6C47FF" "primary"
            color_swatch "#0A0A0F" "background"
            color_swatch "#F0EEFF" "foreground"
            color_swatch "#13131F" "card"
            color_swatch "#9490B5" "muted-foreground"
        else
            echo -e "  ${YELLOW}Cancelled.${NC}\n"
        fi
        step_footer; return
    fi

    # --- Setup UI colors ---
    show_header
    echo -e "${BOLD}🎨 Setup UI Colors${NC}\n"
    echo -e "Pick your colors at ${CYAN}coolors.co${NC} or ${CYAN}tailwindcss.com/docs/customizing-colors${NC}"
    echo -e "Copy a hex code (e.g. ${YELLOW}#16a34a${NC}) and paste it below.\n"
    echo -e "${RED}⚠️  Rule:${NC} Always use semantic tokens in components — never hardcode hex in JSX.\n"

    local color_tokens=("--color-primary" "--color-primary-foreground" "--color-background" "--color-foreground" "--color-card" "--color-card-foreground" "--color-muted" "--color-muted-foreground" "--color-secondary" "--color-secondary-foreground" "--color-accent" "--color-accent-foreground" "--color-border")
    local color_labels=("Primary brand color (buttons, links)" "Text on primary (usually white)" "Page background" "Body text" "Card / panel background" "Card text" "Muted background (subtle areas)" "Muted text (secondary labels)" "Secondary bg (chips, badges)" "Secondary text" "Accent / hover highlight" "Accent text" "Borders and dividers")
    local color_defaults=("#6C47FF" "#ffffff" "#0A0A0F" "#F0EEFF" "#13131F" "#F0EEFF" "#1A1A2E" "#9490B5" "#1A1A2E" "#F0EEFF" "#1E1640" "#F0EEFF" "#2E2A4A")
    local new_tokens=()
    local new_vals=()

    local i
    for i in "${!color_tokens[@]}"; do
        local token="${color_tokens[$i]}"
        local label="${color_labels[$i]}"
        local default="${color_defaults[$i]}"
        local current
        current=$(read_css_token "$token")
        [ -z "$current" ] && current="$default"

        echo -e "${BOLD}$label${NC}"
        [[ "$current" =~ ^#[0-9a-fA-F]{6}$ ]] && color_swatch "$current" "current"
        read -p "  Enter hex (press Enter to keep current): " input < /dev/tty
        input=$(echo "$input" | tr -d ' ')
        if [ -n "$input" ]; then
            [[ "$input" != \#* ]] && input="#$input"
            if [[ "$input" =~ ^#[0-9a-fA-F]{6}$ ]]; then
                new_tokens+=("$token")
                new_vals+=("$input")
                color_swatch "$input" "→ will be set"
            else
                echo -e "  ${RED}❌ Invalid hex — skipped.${NC}"
            fi
        else
            echo -e "  ${YELLOW}Kept:${NC} $current"
        fi
        echo ""
    done

    if [ "${#new_tokens[@]}" -eq 0 ]; then
        echo -e "${YELLOW}No changes made.${NC}\n"
        step_footer; return
    fi

    ask_yes_no "Apply these colors to src/app/globals.css?"
    if [ "$?" -eq 0 ]; then
        for i in "${!new_tokens[@]}"; do
            write_css_token "${new_tokens[$i]}" "${new_vals[$i]}"
        done
        echo -e "\n  ✅ ${GREEN}Colors updated in src/app/globals.css${NC}"
        echo -e "  Run ${CYAN}npm run dev${NC} to preview your new theme.\n"
    else
        echo -e "  ${YELLOW}Cancelled — no changes written.${NC}\n"
    fi

    echo -e "📖 ${BLUE}docs/dannflow_docs/ui-system.md${NC}"
    step_footer
}

# Workflow Command — show daily Vibe Coding loop
show_workflow() {
    show_header
    echo -e "${BOLD}🔄 Daily Vibe Coding Loop${NC}\n"

    echo -e "${BOLD}Before risky schema changes:${NC}"
    echo -e "  ${CYAN}npm run checkpoint${NC}  or  ${CYAN}/checkpoint${NC} in Claude Code\n"

    echo -e "${BOLD}Build with Claude:${NC}"
    echo -e "  Start each session with this copy-paste prompt:\n"
    echo -e "${CYAN}──────────────────────────────────────────────────${NC}"
    echo -e "Read CLAUDE.md before doing anything. Confirm my"
    echo -e "Supabase MCP is connected by listing all tables in the"
    echo -e "public schema, and check that src/types/supabase.ts"
    echo -e "is up to date with the live schema."
    echo -e "${CYAN}──────────────────────────────────────────────────${NC}\n"

    echo -e "${BOLD}After any schema change:${NC}"
    echo -e "  ${CYAN}npm run update-types${NC}  or  ${CYAN}/sync-types${NC} in Claude Code\n"

    echo -e "${BOLD}Pre-PR validation:${NC}"
    echo -e "  ${CYAN}/review${NC}        - Lint + typecheck + guardrail check"
    echo -e "  ${CYAN}/sync-commands${NC} - Validate command docs are in sync\n"

    echo -e "${BOLD}Ship it:${NC}"
    echo -e "  ${CYAN}/commit${NC}        - Stage + draft conventional commit\n"

    echo -e "${BOLD}Commands Quick Reference:${NC}"
    echo -e "  ${CYAN}/checkpoint${NC}    → Snapshot DB before risky changes"
    echo -e "  ${CYAN}/sync-types${NC}    → Regenerate types after schema change"
    echo -e "  ${CYAN}/new-feature${NC}   → Scaffold service + types + page + form"
    echo -e "  ${CYAN}/new-page${NC}      → New App Router page with layout"
    echo -e "  ${CYAN}/ui${NC}            → Make code fully responsive (active rewrite)"
    echo -e "  ${CYAN}/review${NC}        → Pre-PR lint + typecheck + guardrails"
    echo -e "  ${CYAN}/commit${NC}        → Stage + draft conventional commit"
    echo -e "  ${CYAN}/sync-commands${NC}    → Validate command documentation"
    echo -e "  ${CYAN}/sync-upstream${NC}    → Pull updates from DannFlow upstream"
    echo -e "  ${CYAN}/sync-to-upstream${NC} → Contribute your improvements back to DannFlow\n"

    echo -e "📖 Full reference: ${BLUE}docs/dannflow_docs/claude-workflow.md${NC}"
    step_footer
}

# Vibe Check Command — quick health check
show_vibe_check() {
    show_header
    echo -e "${BOLD}🔍 Quick Vibe Check${NC}\n"

    local all_good=1

    # Check 1: .env.local exists
    if [ -f .env.local ]; then
        echo -e "  ${GREEN}✅ .env.local${NC} exists"
    else
        echo -e "  ${RED}❌ .env.local${NC} missing — run ${CYAN}cp .env.example .env.local${NC}"
        all_good=0
    fi

    # Check 2: Supabase keys filled
    local url key
    url=$(grep "^NEXT_PUBLIC_SUPABASE_URL=" .env.local 2>/dev/null | cut -d'=' -f2- | tr -d '"' | tr -d "'")
    key=$(grep "^NEXT_PUBLIC_SUPABASE_ANON_KEY=" .env.local 2>/dev/null | cut -d'=' -f2- | tr -d '"' | tr -d "'")
    if [ -n "$url" ] && [ -n "$key" ]; then
        echo -e "  ${GREEN}✅ Supabase credentials${NC} set in .env.local"
    else
        echo -e "  ${RED}❌ Supabase credentials${NC} missing — fill in .env.local"
        all_good=0
    fi

    # Check 3: Backups exist
    if [ -d supabase/backups ] && [ -n "$(ls -1 supabase/backups/*.sql 2>/dev/null | head -1)" ]; then
        local latest
        latest=$(ls -1t supabase/backups/*.sql 2>/dev/null | head -1 | xargs basename)
        echo -e "  ${GREEN}✅ DB backups${NC} found — latest: ${CYAN}$latest${NC}"
    else
        echo -e "  ${YELLOW}⚠️  No backups${NC} in supabase/backups/ — run ${CYAN}/checkpoint${NC} first"
        all_good=0
    fi

    # Check 4: Types file exists
    if [ -f src/types/supabase.ts ]; then
        echo -e "  ${GREEN}✅ src/types/supabase.ts${NC} exists"
    else
        echo -e "  ${YELLOW}⚠️  src/types/supabase.ts${NC} missing — run ${CYAN}npm run update-types${NC}"
        all_good=0
    fi

    # Check 5: Claude CLI
    if command -v claude &>/dev/null; then
        echo -e "  ${GREEN}✅ Claude CLI${NC} installed"
    else
        echo -e "  ${RED}❌ Claude CLI${NC} not found — install from ${BLUE}claude.ai/code${NC}"
        all_good=0
    fi

    # Check 6: Commands directory
    if [ -d .claude/commands ] && [ -n "$(ls -1 .claude/commands/*.md 2>/dev/null | head -1)" ]; then
        local cmd_count
        cmd_count=$(ls -1 .claude/commands/*.md 2>/dev/null | grep -v README | wc -l)
        echo -e "  ${GREEN}✅ .claude/commands/${NC} ($cmd_count commands)"
    else
        echo -e "  ${RED}❌ .claude/commands${NC} missing or empty"
        all_good=0
    fi

    # Check 7: Dependencies
    if [ -d node_modules ]; then
        echo -e "  ${GREEN}✅ node_modules${NC} installed"
    else
        echo -e "  ${YELLOW}⚠️  node_modules${NC} missing — run ${CYAN}npm install${NC}"
        all_good=0
    fi

    echo ""
    if [ "$all_good" -eq 1 ]; then
        echo -e "${GREEN}✅ All checks passed!${NC} Ready to vibe code.\n"
    else
        echo -e "${YELLOW}⚠️  Some checks need attention (see above).${NC}\n"
    fi

    echo -e "${BOLD}Live vibe check — paste this to Claude:${NC}\n"
    echo -e "${CYAN}──────────────────────────────────────────────────${NC}"
    echo -e "Run a vibe check: List all tables in my Supabase"
    echo -e "public schema, confirm src/types/supabase.ts is"
    echo -e "current, show me the last supabase/backups/ snapshot"
    echo -e "date, and check if there are any uncommitted changes."
    echo -e "${CYAN}──────────────────────────────────────────────────${NC}\n"

    step_footer
}

# Init Command
show_init() {
    local passed_name="$1"
    
    show_header
    echo -e "${RED}${BOLD}⚠️  CRITICAL: RUN ONLY ONCE${NC}"
    echo -e "${RED}This command will rebrand your project and PERMANENTLY REMOVE${NC}"
    echo -e "${RED}all existing Git history to start your own fresh repository.${NC}\n"
    
    echo -e "${BOLD}🚀 Project Rebranding & Initialization${NC}"
    
    if [ -n "$passed_name" ]; then
        app_name="$passed_name"
        echo -e "Using App Name: ${GREEN}${BOLD}$app_name${NC}"
    else
        read -p "Enter your App Name [my-app]: " input_name < /dev/tty
        app_name=${input_name:-"my-app"}
    fi

    # Format for package.json (lowercase, dashes for spaces)
    pkg_name=$(echo "$app_name" | tr '[:upper:]' '[:lower:]' | sed 's/ /-/g' | sed 's/[^a-z0-9-]//g')

    echo -e "\nConfiguring your project...\n"

    # 1. Update .env.local
    if [ -f .env.local ]; then
        # Use cross-platform sed strategy
        sed -i.bak -e "s/^NEXT_PUBLIC_SITE_NAME=.*/NEXT_PUBLIC_SITE_NAME=\"$app_name\"/" .env.local
        rm -f .env.local.bak
        echo -e "✅ Updated ${CYAN}.env.local${NC} NEXT_PUBLIC_SITE_NAME"
    else
        echo -e "⚠️ ${YELLOW}.env.local not found. Run 'cp .env.example .env.local' first.${NC}"
    fi

    # 2. Update package.json
    if [ -f package.json ]; then
        sed -i.bak -e "s/\"name\": \".*\"/\"name\": \"$pkg_name\"/" package.json
        rm -f package.json.bak
        echo -e "✅ Updated ${CYAN}package.json${NC} name to '$pkg_name'"
    fi

    # 3. Update config.ts fallback
    if [ -f src/lib/config.ts ]; then
        sed -i.bak -e "s/name: process.env.NEXT_PUBLIC_SITE_NAME || \".*\"/name: process.env.NEXT_PUBLIC_SITE_NAME || \"$app_name\"/" src/lib/config.ts
        rm -f src/lib/config.ts.bak
        echo -e "✅ Updated ${CYAN}src/lib/config.ts${NC} name fallback"
    fi

    # 4. Commit rebrand on top of existing history
    # NOTE: We intentionally KEEP DannFlow's git history so that:
    #   - GitHub fork relationship survives (Network graph, "forked from" label)
    #   - /sync-upstream has a real common ancestor for accurate diffs
    #   - Provenance and attribution are preserved
    # If you want a clean-slate repo instead, run: rm -rf .git && git init && git add . && git commit -m "init"
    echo -e "📦 ${YELLOW}Committing rebrand on top of upstream history...${NC}"
    if [ -d .git ]; then
        # Stage only the rebrand-touched files (avoid sweeping in user changes)
        git add package.json src/lib/config.ts .env.local 2>/dev/null || true
        if ! git diff --cached --quiet 2>/dev/null; then
            git commit -m "chore: rebrand project to $app_name" > /dev/null
            echo -e "✅ Rebrand commit added (DannFlow history preserved)"
        else
            echo -e "ℹ️  No rebrand changes to commit (already aligned)"
        fi
    else
        # No git directory at all — initialize one as a fallback so downstream tooling works
        echo -e "${YELLOW}⚠️  No .git directory found — initializing fresh repo as fallback${NC}"
        git init > /dev/null
        git add .
        git commit -m "chore: initialize $app_name" > /dev/null
        echo -e "✅ Fresh git repo initialized"
    fi

    # 5. Rename Folder (Last step)
    current_dir_name=$(basename "$PWD")
    if [ "$current_dir_name" != "$pkg_name" ]; then
        echo -e "📂 Renaming folder from '${YELLOW}$current_dir_name${NC}' to '${GREEN}$pkg_name${NC}'..."
        if mv "$PWD" "../$pkg_name" 2>/dev/null; then
            cd "../$pkg_name"
            echo -e "✅ Folder renamed to '${CYAN}$pkg_name${NC}'"
        else
            echo -e "❌ ${RED}Failed to rename folder. It might be in use by another process.${NC}"
        fi
    fi

    echo -e "\n${GREEN}Initialization complete!${NC} Your app is now named ${BOLD}$app_name${NC}."
    echo -e "${YELLOW}Note: Configure your Supabase keys in .env.local to fix 'fetch failed' errors.${NC}"
    echo -e "When you're ready, start the dev server with: ${CYAN}npm run dev${NC}\n"
}

# Routing logic
case "$1" in
    init)          show_init "$2" ;;
    claude|1)      show_claude ;;
    supabase|2)    show_supabase ;;
    env|3)         show_env ;;
    vibe|4)        show_vibe ;;
    security|5)    show_security ;;
    ui|6)          show_ui ;;
    ready|7)       show_ready ;;
    deploy|8)      show_deploy ;;
    commands|cmds) show_commands ;;
    ruflo-commands|ruflo) show_ruflo_commands ;;
    workflow)      show_workflow ;;
    vibe-check|vibecheck) show_vibe_check ;;
    skills-update|taste-update|taste) show_taste ;;
    *)             show_main ;;
esac
