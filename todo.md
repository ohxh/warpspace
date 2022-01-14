In order:
Day 1

x Finish component restructure
x Troubleshoot some hook issues
~ Redo image scraping criteria, eviction

Day 2

- Text scraping
- basic search ingestion (l1 only, no eviction)
- Basic search results into dialog

Day 3

- Add window saving / star-ing api
- Rearranging windows
- Clean up autoscroll stuff

Day 4:

- Search eviction api
- Search restore / re-index

Day 5

- Nice search results w/ previews, click to open

Day 6

- Fork sortable, make desired changes
- Search drag to window
- Tab context menu contents + implementation where possible

Day 8

- New tab page
- Placeholder previews for new tab, chrome:// page

Day 9

- Search windows as well
- Notes

Day 10

- Redo settings
- Rebindable shortcuts for common actions
- Enable / disable for gestures

Day 11

- Privacy settings
- Blacklist schemes
- Delete history

Day 12

- Logo
- Marketing site landing page

- [~] Tab selection + dragging
  - [x] Select / drag
  - [~] Update browser state
  - [ ] Autoscroll, turn off snap
  - [x] Context menu
  - [ ] Rearrange windows
- [x] Custom focus control
  - [x] Non-jank scroll between windows
- [x] Fix focus hider / frame rendering
- [x] Click to switch to tab

Start dogfooding (!)

- [~] Better timing on image scraping, throw away result if tab changes
- [ ] Prettier fallback for...
  - [x] No preview
  - [ ] No title
  - [x] No icons
- [ ] Naming / saving windows
- [~] New tab page
- [ ] Fork sortable
  - [ ] Only select with alt held
- [~] Refactor / clean up
  - [ ] Standardize message passing format
- [ ] Basic visual performance
  - [x] Jitter in zoom out
  - [~] Find a way to move minimap without rerendering entire app
  - [ ] Initial tab load time
  - [x] Split vendor files for each entrypoint
  - [ ] Remove unused deps
  - [ ] Application lag
  - [ ] Troubleshoot hook rerenders
- [ ] Text scraping
- [ ] Search index
- [ ] Search preview extractor, ui
- [ ] Search index checkpoint / revive
- [ ] Search UI

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

- Settings
- Selection

Style:

- Decide on spacing, font sizes
- Tailwind plugin for sortable states
