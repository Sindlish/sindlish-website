---
title: Number guessing game
summary: Build a small terminal game with loops and conditions.
enableTableOfContents: true
---

This guide walks you through a small game: the computer picks a number, you guess, and it tells you if you went high or low. It ties together loops, conditions, input, and functions.

Because `puch` (Sindlish's input function) reads from a terminal, you should save this to a file and run it with the CLI:

```bash
sindlish game.sd
```

The online Run button does not provide a terminal, so the full game there would hang.

## Picking the target

For a simple game, use a fixed secret number. Later you could make it random. Here the computer has chosen `7`:

```sd
silsiloAdad = 7
```

A variable called `jalab` counts how many guesses the player has made. Start it at `0`.

## Getting a guess

`puch` prints its prompt and returns a line of text from the terminal. The result is always a `lafz` (string), so you need to cast it with `adad`:

```sd illustrative
puk = adad(puch("Tajribo karo: "))
```

The problem is that `adad("abc")` stops the program with a `HalndeVaktGhalti`. In a real game you want safe casting, and the [parse input](/docs/how-to/parse-input) page shows you how to build a helper that returns a Result instead.

## Comparing the guess

Sindlish's conditions read naturally:

```sd illustrative
agar puk == silsiloAdad {
  likh("Milkyo!")
} yawari puk > silsiloAdad {
  likh("Wadho aahe. Choto chaiyo.")
} warna {
  likh("Choto aahe. Wadho chaiyo.")
}
```

## The full game

Putting it all together with a loop that caps the number of attempts:

```sd illustrative
silsiloAdad = 7
jalab = 0
likh("Mein 1 te 10 taak ek adad sochyan. Tajribo karo!")

jistain jalab < 5 {
  jalab = jalab + 1
  puk = adad(puch("Tajribo #: "))

  agar puk == silsiloAdad {
    likh("Milkyo! " + lafz(jalab) + " koshish mein.")
    tor
  } yawari puk > silsiloAdad {
    likh("Wadho aahe.")
  } warna {
    likh("Choto aahe.")
  }
}
```

If the loop runs out without a hit, the player loses. You could add a final message after the loop, or let it end quietly.

## Next steps

This game only handles whole numbers that the player knows are valid. The companion guide on [parsing input](/docs/how-to/parse-input) adds input validation so your program does not crash on unexpected text.
