function last_history_item -d 'Expand last history item'
    echo $history[1]
end
abbr -a !! --position anywhere --function last_history_item