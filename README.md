# @mizchi/script-host

Just host js script with rebuild

## How to use

```bash
$ deno install -Afg jsr:@mizchi/script-host
$ script-host your-script.ts -p 9999
[Browser] await import("http://localhost:9999/?"+Math.random())
[Bookmarklet] javascript:import("http://localhost:9999/?"+Math.random())
```

## LICENSE

MIT