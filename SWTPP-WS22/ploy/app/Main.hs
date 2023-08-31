module Main (main) where

import System.Random
import System.Environment

import Ploy (listMoves)
import Board (buildBoard, Player (White, Black))


main :: IO ()
main = do
    args <- getArgs
    let (fen:p:_) = args
        player = if p == "w" then White else Black
        moves = listMoves (buildBoard fen) player in
            if (last args) == "-all" then
                putStrLn (show moves)
            else
                do
                    rand <- randomRIO (0, (length moves)-1)
                    putStrLn (show (moves!!rand)) 

