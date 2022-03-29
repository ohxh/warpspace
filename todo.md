- Logo
- Marketing site landing page

- [~] Tab selection + dragging
  - [x] Select / drag
  - [~] Update browser state
  - [x] Autoscroll, turn off snap
  - [x] Context menu
  - [ ] Rearrange windows
- [x] Custom focus control
  - [x] Non-jank scroll between windows
- [x] Fix focus hider / frame rendering
- [x] Click to switch to tab

Start dogfooding (!)

- [~] Better timing on image scraping, throw away result if tab changes
  - [x] Scrape on scroll
  - [x] Scrape on navigate
  - [~] Invalidate if needed
- [x] Prettier fallback for...
  - [x] No preview
  - [x] No title
  - [x] No icons
- [~] Browser zoom tracker / inverter
  - [x] counter zoom
  - [ ] fix text rendering / jank margins
  - [x] Listen for changes
- [ ] Better pinch zoom tracker
  - It seems the current scroll dynamics are right
  - [x] Only initiate zoom if this motion up _started_ from zero
  - [ ] Account for max zoom in
  - [ ] Account for threshold to begin zoom
- [ ] Naming / saving windows
- [~] New tab page
- [x] Fork sortable
  - [x] Only select with alt held
  - [ ] Keyboard control of selection
- [ ] Thread react-flip-toolkit through sortable for remote updates
- [~] Refactor / clean up
  - [ ] Standardize message passing format
- [ ] Get npm patches working for sortable
- [ ] Basic visual performance
  - [x] Jitter in zoom out
  - [x] Find a way to move minimap without rerendering entire app
  - [x] Fix tab mouse down effect
  - [ ] Initial tab load time
  - [x] Split vendor files for each entrypoint
  - [ ] Remove unused deps
  - [x] Video memory used up on page scroll
  - [x] Rerender new frame before leaving tab
  - [ ] Application lag
  - [x] Troubleshoot hook rerenders
  - [x] Delay in query return when OS context switching in
  - [ ] Listeners disconnecting
- [x] Text scraping
- [~] Search index
- [ ] Search preview extractor, ui
- [x] Search index checkpoint / revive
- [~] Search UI
  - [x] Search results transition on open, arrow key navigation
  - [ ] Windows in search
- [ ] Bug: Pointer events mismatched with opacity (sometimes)
- [ ] Maybe bug: inifnite cpu loop
- [ ] Finalize + clean up data schemas
- [ ] Fix crunchpreview dealing with aspect ratio
- [ ] Tune crunchpreview
- [x] Persist data
- [ ] Make logo

Give to close friends

- [~] Settings Panel
- [ ] Privacy review
- [ ] Hot startup
- [ ] Performance
- [ ] Accounts / licenses

Start beta

- [ ] PDF Viewer
- [ ] Notes
- [ ] Marketing site
- [ ] Tutorial
- [ ] Sharing collections

Release

New architecture:

App (updates state on every select, every scroll, every data update )
Creates context for selection of tabs

- Search
- Settings panel
- Minimap (take scroll value)
- Carousel (memoized, takes entire data)
  - Window (contents slotted in)
    - WindowHeader
    - Tab
      - ContentMenuWrapper (contents slotted in, modify to avoid rendering interior)
        - TabContent
        - ContextMenuInterior (listens to selection context)

Contexts:

x Settings
x Selection

Style:

- Decide on spacing, font sizes
  x Tailwind plugin for sortable states

Context menus

Single:

- Close
- Move to
- Add to

How to find windows:

Breakthrough: Run in fullscreen mode, all the time
Need to replace:
Forward / back / refresh
Insert UI into page?
Maybe eventually...

Links between windows. How to do

Doesn't matter how it's populated, need a suggestions place that's browseable
Below window zoomed out?

Capture timing:

Do everything in child frames (except own) and pass up a message if top != self
Scroll (pass in true as last argument to capture, not bubble)
Click
Media load
Message from child frame
Some kind of network snoop
_not_ mouse move

-> Pass this all to top-level controller for debounce.
Maybe semantic handlers (wheel distance)
