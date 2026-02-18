#
# abbreviations
#

set -q MY_ABBRS_INITIALIZED; and return

abbr -a -- - 'cd -'
abbr -a -- tarls 'tar -tvf'
abbr -a -- untar 'tar -xv'

# single key
abbr -a -- c clear
abbr -a -- h history
abbr -a -- l 'ls -UF'

# fix common typos
abbr -a -- quit 'exit'
abbr -a -- cd.. 'cd ..'
abbr -a -- hyprland 'Hyprland'

# mask built-ins with better defaults
abbr -a -- mkdir 'mkdir -p'
abbr -a -- ping 'ping -c 5'
abbr -a -- type 'type -a'hy
if type -q nvim 
    abbr -a -- vi 'nvim' 
    abbr -a -- vim 'nvim' 
else
    abbr -a -- vi 'vim'
end

# better ls
if type -q lsd
    abbr -a -- ls 'lsd --group-dirs first --date=relative'
    abbr -a -- la 'lsd -lAFh --group-dirs first --date=relative' 	
    abbr -a -- ll 'lsd -l --group-dirs first --date=relative'      	
    abbr -a -- ldot 'lsd -ld .* --group-dirs first --date=relative'
else
    abbr -a -- la 'ls -lAFh' #'ls -lah'
    abbr -a -- ll 'ls -lGFh' #'ls -l' 
    abbr -a -- ldot 'ls -ld .*'
end

# date/time
abbr -a -- ds 'date +%Y-%m-%d'
abbr -a -- ts 'date +%Y-%m-%dT%H:%M:%SZ'
abbr -a -- yyyymmdd 'date +%Y%m%d'

# misc program replacements (htop, bat, ncdu, neovim, httpie, fd, duf, tldr)
if type -q htop
    abbr -a -- top 'htop'
end
if type -q bat 
    abbr -a -- cat 'bat -p'
end
if type -q ndcu 
    abbr -a -- du 'ncdu'
end
if type -q duf 
    abbr -a -- df 'duf'
end

# flatpaks
# alias code='flatpak run com.visualstudio.code --background'

# system maintenance / debug
abbr -a -- nobara-sync 'nobara-sync cli'
abbr -a -- killall-wine "kill -9 $(ps -ef | grep -E -i '(wine|processid|\.exe)' | awk '{print $2}')"
abbr -a -- update-dots "cd ~/.cache/git/dots-hyprland/ && git stash && git pull origin main && git submodule update --init --recursive && ./setup install"

# no need to run over-and-over
set -g MY_ABBRS_INITIALIZED true
