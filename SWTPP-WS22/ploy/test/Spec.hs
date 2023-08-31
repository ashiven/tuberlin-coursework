-- #############################################################################
-- ########### YOUR UNIT TESTS                                    ##############
-- ########### Note: execute tests using "stack test ploy:test    ##############
-- #############################################################################

import Test.Hspec

import Board
import Ploy 

main :: IO ()
main = hspec $ do
    testSomething
    testValidateFEN
    testBuildBoard
    testLine
    testGameFinished
    testIsValidMove
    testPossibleMoves
    testListMoves

sampleBoard :: Board
sampleBoard = [[Empty,Piece White 84,Piece White 41,Piece White 56,Empty,Piece White 56,Piece White 41,Piece White 84,Empty],[Empty,Empty,Piece White 24,Piece White 40,Piece White 17,Piece White 40,Piece White 48,Empty,Empty],[Empty,Empty,Empty,Piece White 16,Piece White 16,Piece White 16,Empty,Empty,Empty],[Empty,Empty,Empty,Empty,Empty,Empty,Empty,Empty,Empty],[Empty,Empty,Empty,Empty,Empty,Empty,Empty,Empty,Empty],[Empty,Empty,Empty,Empty,Empty,Empty,Empty,Empty,Empty],[Empty,Empty,Empty,Piece Black 1,Piece Black 1,Piece Black 1,Empty,Empty,Empty],[Empty,Empty,Piece Black 3,Piece Black 130,Piece Black 17,Piece Black 130,Piece Black 129,Empty,Empty],[Empty,Piece Black 69,Piece Black 146,Piece Black 131,Piece Black 170,Piece Black 131,Piece Black 146,Piece Black 69,Empty]]

sampleBoard' :: Board
sampleBoard' = [[Empty,Piece White 84,Piece White 41,Piece White 56,Piece White 170,Piece White 56,Piece White 41,Piece White 84,Empty],[Empty,Empty,Piece White 24,Piece White 40,Piece White 17,Piece White 40,Piece White 48,Empty,Empty],[Empty,Empty,Empty,Piece White 16,Piece White 16,Piece White 16,Empty,Empty,Empty],[Empty,Empty,Empty,Empty,Empty,Empty,Empty,Empty,Empty],[Empty,Empty,Empty,Empty,Empty,Empty,Empty,Empty,Empty],[Empty,Empty,Empty,Empty,Empty,Empty,Empty,Empty,Empty],[Empty,Empty,Empty,Piece Black 1,Piece Black 1,Piece Black 1,Empty,Empty,Empty],[Empty,Empty,Piece Black 3,Piece Black 130,Piece Black 17,Piece Black 130,Piece Black 129,Empty,Empty],[Empty,Piece Black 69,Piece Black 146,Piece Black 131,Piece Black 170,Piece Black 131,Piece Black 146,Piece Black 69,Empty]]

sampleBoard'' :: Board
sampleBoard'' = [[Empty,Empty,Empty,Empty,Piece White 170,Empty,Empty,Empty,Empty],[Empty,Empty,Empty,Empty,Empty,Empty,Empty,Empty,Empty],[Empty,Empty,Empty,Empty,Empty,Empty,Empty,Empty,Empty],[Empty,Empty,Empty,Empty,Empty,Empty,Empty,Empty,Empty],[Empty,Empty,Empty,Empty,Empty,Empty,Empty,Empty,Empty],[Empty,Empty,Empty,Empty,Empty,Empty,Empty,Empty,Empty],[Empty,Empty,Empty,Empty,Empty,Empty,Empty,Empty,Empty],[Empty,Empty,Empty,Empty,Empty,Empty,Empty,Empty,Empty],[Empty,Empty,Empty,Empty,Piece Black 170,Empty,Empty,Empty,Empty]]

sampleBoard''' :: Board
sampleBoard''' = [[Empty,Empty,Empty,Empty,Piece White 170,Piece White 17,Empty,Empty,Empty],[Empty,Empty,Empty,Empty,Empty,Empty,Empty,Empty,Empty],[Empty,Empty,Empty,Empty,Empty,Empty,Empty,Empty,Empty],[Empty,Empty,Empty,Empty,Empty,Empty,Empty,Empty,Empty],[Empty,Empty,Empty,Empty,Empty,Empty,Empty,Empty,Empty],[Empty,Empty,Empty,Empty,Empty,Empty,Empty,Empty,Empty],[Empty,Empty,Empty,Empty,Empty,Empty,Empty,Empty,Empty],[Empty,Empty,Empty,Empty,Empty,Empty,Empty,Empty,Empty],[Empty,Empty,Empty,Empty,Piece Black 170,Empty,Empty,Empty,Empty]]

sampleBoard'''' :: Board
sampleBoard'''' = [[Empty,Empty,Empty,Empty,Piece White 170,Empty,Empty,Empty,Empty],[Empty,Empty,Empty,Empty,Empty,Empty,Empty,Empty,Empty],[Empty,Empty,Empty,Empty,Empty,Empty,Empty,Empty,Empty],[Empty,Empty,Empty,Empty,Empty,Empty,Empty,Empty,Empty],[Empty,Empty,Empty,Empty,Empty,Empty,Empty,Empty,Empty],[Empty,Empty,Empty,Empty,Empty,Empty,Empty,Empty,Empty],[Empty,Empty,Empty,Empty,Empty,Empty,Empty,Empty,Empty],[Empty,Empty,Empty,Empty,Empty,Empty,Empty,Empty,Empty],[Empty,Empty,Empty,Empty,Empty,Empty,Empty,Empty,Empty]]

sampleBoardA :: Board 
sampleBoardA = [[Piece Black 1,Piece Black 1,Piece Black 1,Piece Black 1,Piece Black 1,Piece Black 1,Piece Black 1,Piece Black 1,Piece Black 1],[Piece Black 1,Piece Black 1,Piece Black 1,Piece Black 1,Piece Black 1,Piece Black 1,Piece Black 1,Piece Black 1,Piece Black 1],[Piece Black 1,Piece Black 1,Piece Black 1,Piece Black 1,Piece Black 1,Piece Black 1,Piece Black 1,Piece Black 1,Piece Black 1],[Piece Black 1,Piece Black 1,Piece Black 1,Piece Black 1,Piece Black 1,Piece Black 1,Piece Black 1,Piece Black 1,Piece Black 1],[Piece Black 1,Piece Black 1,Piece Black 1,Piece Black 1,Piece Black 1,Piece Black 1,Piece Black 1,Piece Black 1,Piece Black 1],
                [Piece Black 1,Piece Black 1,Piece Black 1,Piece Black 1,Piece Black 1,Piece Black 1,Piece Black 1,Piece Black 1,Piece Black 1],[Piece Black 1,Piece Black 1,Piece Black 1,Piece Black 1,Piece Black 1,Piece Black 1,Piece Black 1,Piece Black 1,Piece Black 1],[Piece Black 1,Piece Black 1,Piece Black 1,Piece Black 1,Piece Black 1,Piece Black 1,Piece Black 1,Piece Black 1,Piece Black 1],[Piece Black 1,Piece Black 1,Piece Black 1,Piece Black 1,Piece Black 1,Piece Black 1,Piece Black 1,Piece Black 1,Piece Black 1]]

testSomething :: Spec
testSomething = describe "Shows und so " $ do
        it "show Player works" $ do
            show Black `shouldBe` ("Black")
        it "show Cell works" $ do
            show (Piece Black 15) `shouldBe` ("Piece Black 15") 
        it "show Pos works" $ do
            show (Pos 'e' 7) `shouldBe` ("Pos {col = 'e', row = 7}")
        it "instance Eq Black works" $ do
            Black == Black `shouldBe` (True :: Bool)
        it "instance Eq Black works" $ do
            White == White `shouldBe` (True :: Bool)
        it "instance Eq Cell works" $ do
            (Piece White 10) == (Piece White 10) `shouldBe` (True :: Bool)
        it "show Move works" $ do
            show (Move (Pos 'e' 5) (Pos 'e' 7) 0) `shouldBe` ("e5-e7-0")
        it "rotate works" $ do
            rotate 1 1 `shouldBe` (2)
        it "show Pos works" $ do 
            show(col (Pos 'e' 5)) `shouldBe` ("'e'")
            show(row (Pos 'e' 5)) `shouldBe` ("5")
        it "show Move works" $ do 
            show(start (Move (Pos 'e' 5) (Pos 'e' 6) 3)) `shouldBe` ("Pos {col = 'e', row = 5}")
            show(target (Move (Pos 'e' 5) (Pos 'e' 6) 3)) `shouldBe` ("Pos {col = 'e', row = 6}")
            show(turn (Move (Pos 'e' 5) (Pos 'e' 6) 3)) `shouldBe` ("3")

testValidateFEN :: Spec
testValidateFEN = describe "Module Board: validateFEN ..." $ do
        it "invalid fen works" $ do
            validateFEN ",,,,,,,,,/,,,,,,,,," `shouldBe` (False :: Bool)
        it "valid fen works" $ do
            validateFEN ",w30,,,,,,,/,,,,,,,,/,,,,,,,,/,,,,,,,,/,,,,,,,,/,,,,,,,,/,,,,,,,,/,,,,,,,,/,,,,,,,," `shouldBe` (True :: Bool)
        it "empty string is false" $ do
            validateFEN "" `shouldBe` (False :: Bool)
            hallo "" `shouldBe` ([])

testBuildBoard :: Spec
testBuildBoard = describe "Module Board: buildBoard ..." $ do
        it "building a valid board works" $ do
            buildBoard ",w30,,,,,,,/,,,,,,,,/,,,,,,,,/,,,,,,,,/,,,,,,,,/,,,,,,,,/,,,,,,,,/,,,,,,,,/,,,,,,,," `shouldBe` [[Empty,(Piece White 30),Empty,Empty,Empty,Empty,Empty,Empty,Empty],[Empty,Empty,Empty,Empty,Empty,Empty,Empty,Empty,Empty],[Empty,Empty,Empty,Empty,Empty,Empty,Empty,Empty,Empty],[Empty,Empty,Empty,Empty,Empty,Empty,Empty,Empty,Empty],[Empty,Empty,Empty,Empty,Empty,Empty,Empty,Empty,Empty],[Empty,Empty,Empty,Empty,Empty,Empty,Empty,Empty,Empty],[Empty,Empty,Empty,Empty,Empty,Empty,Empty,Empty,Empty],[Empty,Empty,Empty,Empty,Empty,Empty,Empty,Empty,Empty],[Empty,Empty,Empty,Empty,Empty,Empty,Empty,Empty,Empty]]
        it "helper works" $ do
            help "b30" `shouldBe` ((Piece Black 30) :: Cell)
            help "w30" `shouldBe` ((Piece White 30) :: Cell)

testLine :: Spec
testLine = describe "Module Board: line ..." $ do
        it "line in place works" $ do
            line (Pos 'e' 5) (Pos 'e' 5) `shouldBe` ([(Pos 'e' 5)] :: [Pos])
        it "creating line works" $ do
            line (Pos 'e' 8) (Pos 'e' 9) `shouldBe` ([Pos {col = 'e', row = 8},Pos {col = 'e', row = 9}])
            line (Pos 'e' 6) (Pos 'e' 7) `shouldBe` ([Pos {col = 'e', row = 6},Pos {col = 'e', row = 7}])
            line (Pos 'e' 8) (Pos 'f' 9) `shouldBe` ([Pos {col = 'e', row = 8},Pos {col = 'f', row = 9}])
            line (Pos 'e' 8) (Pos 'f' 8) `shouldBe` ([Pos {col = 'e', row = 8},Pos {col = 'f', row = 8}])
            line (Pos 'h' 8) (Pos 'i' 8) `shouldBe` ([Pos {col = 'h', row = 8},Pos {col = 'i', row = 8}])
            line (Pos 'e' 8) (Pos 'f' 7) `shouldBe` ([Pos {col = 'e', row = 8},Pos {col = 'f', row = 7}])
            line (Pos 'e' 8) (Pos 'e' 7) `shouldBe` ([Pos {col = 'e', row = 8},Pos {col = 'e', row = 7}])
            line (Pos 'e' 2) (Pos 'e' 1) `shouldBe` ([Pos {col = 'e', row = 2},Pos {col = 'e', row = 1}])
            line (Pos 'e' 8) (Pos 'd' 7) `shouldBe` ([Pos {col = 'e', row = 8},Pos {col = 'd', row = 7}])
            line (Pos 'e' 8) (Pos 'd' 8) `shouldBe` ([Pos {col = 'e', row = 8},Pos {col = 'd', row = 8}])
            line (Pos 'b' 8) (Pos 'a' 8) `shouldBe` ([Pos {col = 'b', row = 8},Pos {col = 'a', row = 8}])
            line (Pos 'e' 8) (Pos 'd' 9) `shouldBe` ([Pos {col = 'e', row = 8},Pos {col = 'd', row = 9}])

testGameFinished :: Spec
testGameFinished = describe "Module Game: gameFinished ..." $ do
        it "gameFinished returns correct values" $ do
            gameFinished sampleBoard `shouldBe` (True :: Bool)
            gameFinished sampleBoard' `shouldBe` (False :: Bool)
            gameFinished sampleBoard'' `shouldBe` (True :: Bool)
            gameFinished sampleBoard''' `shouldBe` (True :: Bool)
            gameFinished sampleBoard'''' `shouldBe` (True :: Bool)
        it "various helper functions work" $ do
            isCommanderW (Piece White 170) `shouldBe` (True :: Bool)
            isCommanderW (Piece White 85) `shouldBe` (True :: Bool)
            isCommanderB (Piece Black 170) `shouldBe` (True :: Bool)
            isCommanderB (Piece Black 85) `shouldBe` (True :: Bool)
            isCommanderB (Empty) `shouldBe` (False :: Bool)
            containsCommanderB sampleBoard `shouldBe` (True :: Bool)
            isWhite (Piece White 17) `shouldBe` (True :: Bool)
            isWhite (Piece Black 17) `shouldBe` (False :: Bool)
            isWhite (Empty) `shouldBe` (False :: Bool)
            isBlack (Piece Black 17) `shouldBe` (True :: Bool)
            isBlack (Piece White 17) `shouldBe` (False :: Bool)
            isBlack (Empty) `shouldBe` (False :: Bool)
            funcW 1 (Piece White 17) `shouldBe` (2)
            funcB 1 (Piece Black 17) `shouldBe` (2)
            countWhitePieces sampleBoard `shouldBe` (14)
            countBlackPieces sampleBoard `shouldBe` (15)

testIsValidMove :: Spec
testIsValidMove = describe "Module Game: isValidMove ..." $ do
        it "isValidMove returns correct answers" $ do
            isValidMove sampleBoard (Move (Pos 'c' 1) (Pos 'c' 1) 1) `shouldBe` (True :: Bool)
            isValidMove sampleBoard (Move (Pos 'e' 3) (Pos 'e' 7) 0) `shouldBe` (True :: Bool)
            isValidMove sampleBoard (Move (Pos 'e' 7) (Pos 'e' 3) 0) `shouldBe` (True :: Bool)
            isValidMove sampleBoard (Move (Pos 'e' 3) (Pos 'f' 3) 0) `shouldBe` (False :: Bool)
        it "various helper functions work" $ do
            targetIsValid sampleBoard (Move (Pos 'e' 3) (Pos 'e' 7) 0) `shouldBe` (True :: Bool)
            targetIsValid sampleBoard (Move (Pos 'e' 3) (Pos 'f' 3) 0) `shouldBe` (False :: Bool)
            targetIsValid sampleBoard (Move (Pos 'e' 3) (Pos 'e' 5) 0) `shouldBe` (True :: Bool)
            charInt 'a' `shouldBe` (0)
            charInt 'b' `shouldBe` (1)
            charInt 'c' `shouldBe` (2)
            charInt 'd' `shouldBe` (3)
            charInt 'f' `shouldBe` (5)
            charInt 'g' `shouldBe` (6)
            charInt 'h' `shouldBe` (7)
            charInt 'i' `shouldBe` (8)
            roadIsEmpty sampleBoard (Move (Pos 'e' 2) (Pos 'e' 4) 0) `shouldBe` (False :: Bool)
            roadIsEmpty sampleBoard (Move (Pos 'e' 3) (Pos 'e' 5) 0) `shouldBe` (True :: Bool)
             


testPossibleMoves :: Spec
testPossibleMoves = describe "Module Game: possibleMoves ..." $ do
        it "possibleMoves works" $ do
            possibleMoves (Pos 'd' 3) (Piece White 1) `shouldContain` ([Move (Pos 'd' 3) (Pos 'd' 4) 0] :: [Move])
            possibleMoves (Pos 'e' 5) (Piece White 255) `shouldBe` ([])
            possibleMoves (Pos 'e' 5) (Piece White 170) `shouldContain` ([Move (Pos 'e' 5) (Pos 'd' 4) 0] :: [Move])
            possibleMoves (Pos 'e' 5) (Piece White 17) `shouldContain` ([Move (Pos 'e' 5) (Pos 'e' 6) 0] :: [Move])
            possibleMoves (Pos 'e' 5) (Piece White 69) `shouldContain` ([Move (Pos 'e' 5) (Pos 'e' 6) 0] :: [Move])
            possibleMoves (Pos 'e' 5) (Piece White 3) `shouldContain` ([Move (Pos 'e' 5) (Pos 'f' 6) 0] :: [Move])
            possibleMoves (Pos 'e' 5) Empty `shouldBe` ([])
        it "various helper functions work" $ do
            isProbe (Piece White 1) `shouldBe` (False :: Bool)
            isProbe Empty `shouldBe` (False :: Bool)
            isProbe (Piece White 17) `shouldBe` (True :: Bool)
            isShield Empty `shouldBe` (False :: Bool)
            isShield (Piece White 255) `shouldBe` (False :: Bool)
            isLance Empty `shouldBe` (False :: Bool)
            isLance (Piece White 69) `shouldBe` (True :: Bool)
            isLance (Piece White 255) `shouldBe` (False :: Bool)
            isProbeOne Empty `shouldBe` (False :: Bool)
            isProbeOne (Piece White 17) `shouldBe` (True :: Bool)
            isProbeOne (Piece White 34) `shouldBe` (True :: Bool)
            isProbeOne (Piece White 68) `shouldBe` (True :: Bool)
            isProbeOne (Piece White 136) `shouldBe` (True :: Bool)
            toBin 0 `shouldBe` ([0])
            createIndexList 255 `shouldBe` ([(1,7),(1,6),(1,5),(1,4),(1,3),(1,2),(1,1),(1,0)])
            pieceDirections (Piece White 255) `shouldBe` (["NordWest","West","SuedWest","Sued","SuedOst","Ost","NordOst","Nord"])
            pieceDirections Empty `shouldBe` ([])
            accumulatePositionsTwo (Piece White 255) (Pos 'e' 5) `shouldBe` ([Pos {col = 'd', row = 6},Pos {col = 'c', row = 7},Pos {col = 'd', row = 5},Pos {col = 'c', row = 5},Pos {col = 'd', row = 4},Pos {col = 'c', row = 3},Pos {col = 'e', row = 4},Pos {col = 'e', row = 3},Pos {col = 'f', row = 4},Pos {col = 'g', row = 3},Pos {col = 'f', row = 5},Pos {col = 'g', row = 5},Pos {col = 'f', row = 6},Pos {col = 'g', row = 7},Pos {col = 'e', row = 6},Pos {col = 'e', row = 7}])
            accumulatePositionsThree (Piece White 255) (Pos 'e' 5) `shouldBe` ([Pos {col = 'd', row = 6},Pos {col = 'c', row = 7},Pos {col = 'b', row = 8},Pos {col = 'd', row = 5},Pos {col = 'c', row = 5},Pos {col = 'b', row = 5},Pos {col = 'd', row = 4},Pos {col = 'c', row = 3},Pos {col = 'b', row = 2},Pos {col = 'e', row = 4},Pos {col = 'e', row = 3},Pos {col = 'e', row = 2},Pos {col = 'f', row = 4},Pos {col = 'g', row = 3},Pos {col = 'h', row = 2},Pos {col = 'f', row = 5},Pos {col = 'g', row = 5},Pos {col = 'h', row = 5},Pos {col = 'f', row = 6},Pos {col = 'g', row = 7},Pos {col = 'h', row = 8},Pos {col = 'e', row = 6},Pos {col = 'e', row = 7},Pos {col = 'e', row = 8}])
            accumulatePositionsOne (Piece White 255) (Pos 'e' 5) `shouldBe` ([Pos {col = 'd', row = 6},Pos {col = 'd', row = 5},Pos {col = 'd', row = 4},Pos {col = 'e', row = 4},Pos {col = 'f', row = 4},Pos {col = 'f', row = 5},Pos {col = 'f', row = 6},Pos {col = 'e', row = 6}])
            addTurnsToMove (Move (Pos 'e' 5) (Pos 'e' 5) 0) 7 `shouldBe` ([(Move (Pos 'e' 5) (Pos 'e' 5) 7)])
            addTurnsToMove (Move (Pos 'e' 5) (Pos 'e' 5) 0) 5 `shouldBe` ([(Move (Pos 'e' 5) (Pos 'e' 5) 5),(Move (Pos 'e' 5) (Pos 'e' 5) 6),(Move (Pos 'e' 5) (Pos 'e' 5) 7)])
            filterMoves [(Move (Pos 'e' 5) (Pos 'e' 5) 5),(Move (Pos 'e' 5) (Pos 'e' 5) 6),(Move (Pos 'e' 5) (Pos 'e' 5) 7)] `shouldBe` ([(Move (Pos 'e' 5) (Pos 'e' 5) 5),(Move (Pos 'e' 5) (Pos 'e' 5) 7)])
            getPositionsOne (Pos 'e' 5) "Naah" `shouldBe` ([])
            getPositionsTwo (Pos 'e' 5) "Naah" `shouldBe` ([])
            getPositionsThree (Pos 'e' 5) "Naah" `shouldBe` ([])
            nordOst (Pos 'h' 8) 0 `shouldBe` ([(Pos 'h' 8),(Pos 'i' 9)])
            suedOst (Pos 'h' 2) 0 `shouldBe` ([(Pos 'h' 2),(Pos 'i' 1)])
            suedWest (Pos 'b' 2) 0 `shouldBe` ([(Pos 'b' 2),(Pos 'a' 1)])
            nordWest (Pos 'b' 8) 0 `shouldBe` ([(Pos 'b' 8),(Pos 'a' 9)])
            nordOst' (Pos 'h' 8) 0 `shouldBe` ([(Pos 'h' 8),(Pos 'i' 9)])
            nordWest' (Pos 'b' 8) 0 `shouldBe` ([(Pos 'b' 8),(Pos 'a' 9)])
            suedOst'' (Pos 'h' 2) 0 `shouldBe` ([(Pos 'h' 2),(Pos 'i' 1)])
            suedWest'' (Pos 'b' 2) 0 `shouldBe` ([(Pos 'b' 2),(Pos 'a' 1)])
            nordOst'' (Pos 'h' 8) 0 `shouldBe` ([(Pos 'h' 8),(Pos 'i' 9)])
            nordWest'' (Pos 'b' 8) 0 `shouldBe` ([(Pos 'b' 8),(Pos 'a' 9)])
            nordOst'' (Pos 'e' 5) 0 `shouldBe` ([(Pos 'e' 5),(Pos 'f' 6)])
            nordWest'' (Pos 'e' 5) 0 `shouldBe` ([(Pos 'e' 5),(Pos 'd' 6)])
            




testListMoves :: Spec
testListMoves = describe "Module Game: listMoves ..." $ do
        it "various listMoves examples work" $ do
            listMoves sampleBoard Black `shouldBe` ([])
            listMoves sampleBoard' White `shouldContain` ([Move (Pos 'e' 7) (Pos 'e' 6) 0])
            listMoves sampleBoard' Black `shouldContain` ([Move (Pos 'e' 3) (Pos 'e' 4) 0])
        it "helper functions work" $ do
            createIndexBoard sampleBoardA `shouldBe` ([(Piece Black 1,Pos {col = 'a', row = 9}),(Piece Black 1,Pos {col = 'b', row = 9}),(Piece Black 1,Pos {col = 'c', row = 9}),(Piece Black 1,Pos {col = 'd', row = 9}),(Piece Black 1,Pos {col = 'e', row = 9}),(Piece Black 1,Pos {col = 'f', row = 9}),(Piece Black 1,Pos {col = 'g', row = 9}),(Piece Black 1,Pos {col = 'h', row = 9}),(Piece Black 1,Pos {col = 'i', row = 9}),
                                                       (Piece Black 1,Pos {col = 'a', row = 8}),(Piece Black 1,Pos {col = 'b', row = 8}),(Piece Black 1,Pos {col = 'c', row = 8}),(Piece Black 1,Pos {col = 'd', row = 8}),(Piece Black 1,Pos {col = 'e', row = 8}),(Piece Black 1,Pos {col = 'f', row = 8}),(Piece Black 1,Pos {col = 'g', row = 8}),(Piece Black 1,Pos {col = 'h', row = 8}),(Piece Black 1,Pos {col = 'i', row = 8}),
                                                       (Piece Black 1,Pos {col = 'a', row = 7}),(Piece Black 1,Pos {col = 'b', row = 7}),(Piece Black 1,Pos {col = 'c', row = 7}),(Piece Black 1,Pos {col = 'd', row = 7}),(Piece Black 1,Pos {col = 'e', row = 7}),(Piece Black 1,Pos {col = 'f', row = 7}),(Piece Black 1,Pos {col = 'g', row = 7}),(Piece Black 1,Pos {col = 'h', row = 7}),(Piece Black 1,Pos {col = 'i', row = 7}),
                                                       (Piece Black 1,Pos {col = 'a', row = 6}),(Piece Black 1,Pos {col = 'b', row = 6}),(Piece Black 1,Pos {col = 'c', row = 6}),(Piece Black 1,Pos {col = 'd', row = 6}),(Piece Black 1,Pos {col = 'e', row = 6}),(Piece Black 1,Pos {col = 'f', row = 6}),(Piece Black 1,Pos {col = 'g', row = 6}),(Piece Black 1,Pos {col = 'h', row = 6}),(Piece Black 1,Pos {col = 'i', row = 6}),
                                                       (Piece Black 1,Pos {col = 'a', row = 5}),(Piece Black 1,Pos {col = 'b', row = 5}),(Piece Black 1,Pos {col = 'c', row = 5}),(Piece Black 1,Pos {col = 'd', row = 5}),(Piece Black 1,Pos {col = 'e', row = 5}),(Piece Black 1,Pos {col = 'f', row = 5}),(Piece Black 1,Pos {col = 'g', row = 5}),(Piece Black 1,Pos {col = 'h', row = 5}),(Piece Black 1,Pos {col = 'i', row = 5}),
                                                       (Piece Black 1,Pos {col = 'a', row = 4}),(Piece Black 1,Pos {col = 'b', row = 4}),(Piece Black 1,Pos {col = 'c', row = 4}),(Piece Black 1,Pos {col = 'd', row = 4}),(Piece Black 1,Pos {col = 'e', row = 4}),(Piece Black 1,Pos {col = 'f', row = 4}),(Piece Black 1,Pos {col = 'g', row = 4}),(Piece Black 1,Pos {col = 'h', row = 4}),(Piece Black 1,Pos {col = 'i', row = 4}),
                                                       (Piece Black 1,Pos {col = 'a', row = 3}),(Piece Black 1,Pos {col = 'b', row = 3}),(Piece Black 1,Pos {col = 'c', row = 3}),(Piece Black 1,Pos {col = 'd', row = 3}),(Piece Black 1,Pos {col = 'e', row = 3}),(Piece Black 1,Pos {col = 'f', row = 3}),(Piece Black 1,Pos {col = 'g', row = 3}),(Piece Black 1,Pos {col = 'h', row = 3}),(Piece Black 1,Pos {col = 'i', row = 3}),
                                                       (Piece Black 1,Pos {col = 'a', row = 2}),(Piece Black 1,Pos {col = 'b', row = 2}),(Piece Black 1,Pos {col = 'c', row = 2}),(Piece Black 1,Pos {col = 'd', row = 2}),(Piece Black 1,Pos {col = 'e', row = 2}),(Piece Black 1,Pos {col = 'f', row = 2}),(Piece Black 1,Pos {col = 'g', row = 2}),(Piece Black 1,Pos {col = 'h', row = 2}),(Piece Black 1,Pos {col = 'i', row = 2}),
                                                       (Piece Black 1,Pos {col = 'a', row = 1}),(Piece Black 1,Pos {col = 'b', row = 1}),(Piece Black 1,Pos {col = 'c', row = 1}),(Piece Black 1,Pos {col = 'd', row = 1}),(Piece Black 1,Pos {col = 'e', row = 1}),(Piece Black 1,Pos {col = 'f', row = 1}),(Piece Black 1,Pos {col = 'g', row = 1}),(Piece Black 1,Pos {col = 'h', row = 1}),(Piece Black 1,Pos {col = 'i', row = 1})])
            filterValidMoves sampleBoard (Pos 'e' 5) Empty `shouldBe` ([])