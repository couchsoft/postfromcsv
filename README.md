# Generate Ghost Blog Posts from CSV

A script to generate Posts in your Ghost blog from a CSV file. 

## Arguments
```
--file Posts.csv
--author someone@somewhere.com
--url https://yourblog.com
--key <YOUR_GHOST_INTEGRATION_ADMIN_API_KEY>
``` 

## CSV Format
Currently a very specific format is used, but the script can be easily changed for your purpose.

```
Tag;Title;Location;Year;Role;People
```

Please check `index.js` for the details.
