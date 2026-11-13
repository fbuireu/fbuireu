# Accessibility

This repository is Ferran Buireu's GitHub profile: the README GitHub shows at
[github.com/fbuireu](https://github.com/fbuireu), in four Editions, and the workflows that refresh its cards and
animations. This page says what the profile does for people reading it with a screen reader, at high zoom or with
reduced motion, how to report a barrier, and what a change has to keep.

## What the profile does

- **Four languages, named in text.** The table at the top links the English, Catalan, Spanish and Italian
  Editions by name, with the flag beside the name rather than in its place, and marks the Edition you are reading.
- **Links that say where they go.** Each badge that links to another profile, such as LinkedIn or Medium, has alt
  text naming the site.
- **Cards that say their figures.** The contribution graph, streak, statistics, languages, trophy and three
  WakaTime cards are images, so their numbers are not text a screen reader can read. Each one's alt text gives the
  card's name and then its main figures, for example the stars, commits, pull requests and issues of the statistics
  card, or the current and longest streak. The weekly refresh that redraws a card rewrites that text from the card
  in the same commit, so the figures match the picture. The card names are in the language of each Edition; the
  figures after them are in English, like the cards.
- **Named cards, without figures.** The repository cards and the metrics card have alt text naming what each one
  shows, but not the numbers on it.
- **A silent heading image.** The animated GIF beside the heading is decoration, so it has an empty alt text and a
  screen reader skips it.
- **Collapsed sections that work from the keyboard.** The card groups are `details` elements, which open with Enter
  or Space.
- **A snake that follows your theme.** The contribution-snake animation has a light and a dark version, picked by
  your system's colour preference.
- **A snake that stops when you ask for less motion.** If your system asks for reduced motion, both versions of
  the snake show the contribution grid standing still, without the snake, instead of looping. The weekly refresh
  adds that rule each time it redraws the snake. It depends on your browser passing the setting to images; it is
  checked in Chromium and not in other browsers.

GitHub renders the README, so the page's structure, its language and how it zooms are GitHub's. The statistics and
repository cards are drawn by a third-party service in a fixed dark theme. The statistics cards are drawn without
animation; the repository cards and the metrics card are animated, and so is the snake unless you ask for reduced
motion.

## Known barriers

Barriers already found are tracked as
[open issues with the `accessibility` label](https://github.com/fbuireu/fbuireu/issues?q=is%3Aissue%20state%3Aopen%20label%3Aaccessibility).

## Reporting a barrier

If part of the profile is hard or impossible for you to use,
[open a bug report](https://github.com/fbuireu/fbuireu/issues/new?template=bug_report.yml). Without a GitHub account,
use any of the contact links in the README. You don't need to say anything about a disability.

Barriers in [curriculum-vitae](https://github.com/fbuireu/curriculum-vitae) and
[hashnode-articles-backup](https://github.com/fbuireu/hashnode-articles-backup), which have no issue tracker of
their own, are reported here too.

Include as much of this as you can:

- What you were trying to read or do, and what happened instead.
- Which Edition, and which section or card, in the form's *Where you saw it* field.
- Your browser, operating system and device.
- Any assistive technology you use, such as a screen reader, magnifier or voice control, and its version.
- Settings that change how pages look or move: zoom or text size, high contrast or forced colours, dark mode,
  reduced motion.
- A screenshot or recording, if you're comfortable sharing one.

### What happens next

- The issue gets the `accessibility` label, so it joins the list above.
- Questions about missing details come in the issue.
- No date is promised for a fix. The fix links the issue, which closes when it lands.

## For contributors

A change to the profile keeps the above working:

- Give every image alt text that says what it shows, or an empty `alt` when it is decoration.
- Make the same change in every Edition, so all four stay equally readable.
- Prefer a card's option to turn its animation off where it has one.
- If a change adds a barrier it cannot avoid, say so in the pull request and open an issue with the
  `accessibility` label.

## Ownership

Ferran Buireu maintains the profile and this page. The page changes in the same commit as the behaviour it
describes.

## Feedback on this page

If something here is wrong, unclear or missing,
[open a documentation issue](https://github.com/fbuireu/fbuireu/issues/new?template=documentation.yml). To report a
barrier, see [Reporting a barrier](#reporting-a-barrier).
