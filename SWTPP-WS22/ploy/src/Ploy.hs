module Ploy where  -- do NOT CHANGE export of module

import Board

-- IMPORTS HERE
-- Note: Imports allowed that DO NOT REQUIRE TO CHANGE package.yaml, e.g.:
--       import Data.Char
import Data.Bits --( (.&.), (.|.), shift )
import Data.List



-- #############################################################################
-- ########################### GIVEN IMPLEMENTATION ############################
-- #############################################################################

data Move = Move {start :: Pos, target :: Pos, turn :: Int}

instance Show Move where
  show (Move (Pos startC startR) (Pos tarC tarR) tr) = [startC] ++ (show startR) ++ "-" ++ [tarC] ++ show tarR ++ "-" ++ show tr

instance Eq Move where
  (==) (Move (Pos sc1 sr1) (Pos tc1 tr1) r1) (Move (Pos sc2 sr2) (Pos tc2 tr2) r2) =
      sc1 == sc2 && sr1 == sr2 && tc1 == tc2 && tr1 == tr2 && r1 == r2 

rotate :: Int -> Int -> Int
rotate o tr = (.&.) ((.|.) (shift o tr) (shift o (tr-8))) 255



-- #############################################################################
-- ####################### gameFinished :: Board -> Bool #######################
-- ####################### - 3 Implementation Points     #######################
-- ####################### - 1 Coverage Point            #######################
-- #############################################################################

isCommanderW :: Cell -> Bool
isCommanderW (Piece White 170) = True
isCommanderW (Piece White 85) = True
isCommanderW (Piece _ _ ) = False
isCommanderW Empty = False

isCommanderB :: Cell -> Bool
isCommanderB (Piece Black 170) = True
isCommanderB (Piece Black 85) = True
isCommanderB (Piece _ _ ) = False
isCommanderB Empty = False

containsCommanderW :: Board -> Bool
containsCommanderW xs = any isCommanderW (concat xs)

containsCommanderB :: Board -> Bool
containsCommanderB xs = any isCommanderB (concat xs)

isWhite :: Cell -> Bool
isWhite (Piece White _) = True
isWhite (Piece Black _) = False
isWhite Empty = False

isBlack :: Cell -> Bool
isBlack (Piece Black _) = True
isBlack (Piece White _) = False
isBlack Empty = False

funcW :: Int -> Cell -> Int
funcW a b = if isWhite b then a + 1 else a

funcB :: Int -> Cell -> Int
funcB a b = if isBlack b then a + 1 else a

countWhitePieces :: Board -> Int
countWhitePieces xs = foldl funcW 0 (concat xs)

countBlackPieces :: Board -> Int
countBlackPieces xs = foldl funcB 0 (concat xs)

gameFinished :: Board -> Bool
gameFinished xs
  | not (containsCommanderW xs) = True
  | not (containsCommanderB xs) = True
  | containsCommanderW xs && countWhitePieces xs == 1 = True
  | containsCommanderB xs && countBlackPieces xs == 1 = True
  | otherwise = False


-- #############################################################################
-- ################### isValidMove :: Board -> Move -> Bool ####################
-- ################### - 5 Implementation Points            ####################
-- ################### - 1 Coverage Point                   ####################
-- #############################################################################

numberOfSteps :: Move -> Int
numberOfSteps Move { start = Pos {col = a1, row = b1} , target = Pos {col = a2, row = b2}, turn = tn }
    = length ( line (Pos {col = a1, row = b1}) (Pos {col = a2, row = b2}) ) - 1

charInt :: Char -> Int 
charInt 'a' = 0
charInt 'b' = 1
charInt 'c' = 2
charInt 'd' = 3
charInt 'e' = 4
charInt 'f' = 5
charInt 'g' = 6
charInt 'h' = 7
charInt 'i' = 8

getRoad :: Move -> [Pos]
getRoad Move { start = Pos {col = a1, row = b1} , target = Pos {col = a2, row = b2}, turn = tn }
    = drop 1 ( init ( line (Pos {col = a1, row = b1}) (Pos {col = a2, row = b2}) ) )

getTarget :: Move -> Pos
getTarget Move { start = Pos {col = a1, row = b1} , target = Pos {col = a2, row = b2}, turn = tn }
    = last ( line (Pos {col = a1, row = b1}) (Pos {col = a2, row = b2}) )

getCellFromBoard :: Board -> Pos -> Cell
getCellFromBoard brd (Pos c r) = brd!!(9 - r)!!(charInt c)

--ueber line zwischen pos's gehen und schauen ob piece empty ist 
roadIsEmpty :: Board -> Move -> Bool
roadIsEmpty brd mv  
    = foldl (\acc x -> if (getCellFromBoard brd x) /= Empty then False else acc ) True (getRoad mv)

{-targetIsValid :: Board -> Move -> Bool
targetIsValid brd (Move (Pos a b) (Pos c d) t)
    |isWhite (getCellFromBoard brd (Pos a b)) && isBlack (getCellFromBoard brd (getTarget (Move (Pos a b) (Pos c d) t))) = True
    |isBlack (getCellFromBoard brd (Pos a b)) && isWhite (getCellFromBoard brd (getTarget (Move (Pos a b) (Pos c d) t))) = True
    |(getCellFromBoard brd (getTarget (Move (Pos a b) (Pos c d) t))) == Empty = True
    |otherwise = False-}
targetIsValid :: Board -> Move -> Bool
targetIsValid brd mv
    |isWhite (getCellFromBoard brd (start (mv))) && isBlack (getCellFromBoard brd (getTarget mv)) = True
    |isBlack (getCellFromBoard brd (start (mv))) && isWhite (getCellFromBoard brd (getTarget mv)) = True
    |(getCellFromBoard brd (getTarget mv)) == Empty = True
    |otherwise = False

isValidMove :: Board -> Move -> Bool
isValidMove brd mv 
    |(numberOfSteps mv) == 0 = True
    |(numberOfSteps mv) > 0 && roadIsEmpty brd mv && targetIsValid brd mv = True
    |otherwise = False 



-- #############################################################################
-- ################### possibleMoves :: Pos -> Cell -> [Move] ##################
-- ################### - 6 Implementation Points              ##################
-- ################### - 1 Coverage Point                     ##################
-- #############################################################################

isShield :: Cell -> Bool
isShield (Empty) = False
isShield (Piece _ num) = if (popCount num) == 1 then True else False

isLance :: Cell -> Bool
isLance Empty = False
isLance (Piece _ num) = if (popCount num) == 3 then True else False

isProbe :: Cell -> Bool
isProbe Empty = False
isProbe (Piece _ num) = if (popCount num) == 2 then True else False

isProbeOne :: Cell -> Bool 
isProbeOne Empty = False
isProbeOne (Piece _ a) = elem a [17,34,68,136]

toBin :: Int -> [Int]
toBin 0 = [0]
toBin n = reverse (func n)
func :: Int -> [Int]
func 0 = []
func n = (n `mod` 2) : func (n `div` 2)
getBinIndices :: [(Int,Int)] -> [Int]
getBinIndices a = map snd [x | x <- a, (fst x) == 1]--[(x,y) | (x,y) <- a, x == 1]
createIndexList :: Int -> [(Int,Int)]
createIndexList x = zip a b where b = [(length a) - 1,(length a) - 2,(length a) - 3,(length a) - 4,(length a) - 5,(length a) - 6,(length a) - 7,(length a) - 8]
                                  a = toBin x 
intToBinIndices :: Int -> [Int]
intToBinIndices a = getBinIndices $ createIndexList a
intToDir :: Int -> String
intToDir 0 = "Nord"
intToDir 1 = "NordOst"
intToDir 2 = "Ost"
intToDir 3 = "SuedOst"
intToDir 4 = "Sued"
intToDir 5 = "SuedWest"
intToDir 6 = "West"
intToDir 7 = "NordWest"
mapIntToDirection :: Int -> [String]
mapIntToDirection a = [(intToDir x) | x <- (intToBinIndices a)]

pieceDirections :: Cell -> [String]
pieceDirections Empty = []
pieceDirections (Piece _ b) = mapIntToDirection b
--takes a startpos, a piece and a direction and returns a line of pos's in that direction 
nordOst :: Pos -> Int -> [Pos]
nordOst (Pos c1 r1) limit
  | c1 == 'i' || r1 == 9 = (Pos c1 r1) : []
  | limit == 2 = (Pos c1 r1) : []
  | otherwise = (Pos c1 r1) : nordOst (Pos (succ c1) (r1 + 1)) (limit + 1)
suedOst :: Pos -> Int -> [Pos]
suedOst (Pos c1 r1) limit
  | c1 == 'i' || r1 == 1 = (Pos c1 r1) : []
  | limit == 2 = (Pos c1 r1) : []
  | otherwise = (Pos c1 r1) : suedOst (Pos (succ c1) (r1 - 1)) (limit + 1)
suedWest :: Pos -> Int -> [Pos]
suedWest (Pos c1 r1) limit
  | c1 == 'a' || r1 == 1 = (Pos c1 r1) : []
  | limit == 2 = (Pos c1 r1) : []
  | otherwise = (Pos c1 r1) : suedWest (Pos (pred c1) (r1 - 1)) (limit + 1)
nordWest :: Pos -> Int -> [Pos]
nordWest (Pos c1 r1) limit
  | c1 == 'a' || r1 == 9 = (Pos c1 r1) : []
  | limit == 2 = (Pos c1 r1) : []
  | otherwise = (Pos c1 r1) : nordWest (Pos (pred c1) (r1 + 1)) (limit + 1)

nordOst' :: Pos -> Int -> [Pos]
nordOst' (Pos c1 r1) limit
  | c1 == 'i' || r1 == 9 = (Pos c1 r1) : []
  | limit == 3 = (Pos c1 r1) : []
  | otherwise = (Pos c1 r1) : nordOst' (Pos (succ c1) (r1 + 1)) (limit + 1)
suedOst' :: Pos -> Int -> [Pos]
suedOst' (Pos c1 r1) limit
  | c1 == 'i' || r1 == 1 = (Pos c1 r1) : []
  | limit == 3 = (Pos c1 r1) : []
  | otherwise = (Pos c1 r1) : suedOst' (Pos (succ c1) (r1 - 1)) (limit + 1)
suedWest' :: Pos -> Int -> [Pos]
suedWest' (Pos c1 r1) limit
  | c1 == 'a' || r1 == 1 = (Pos c1 r1) : []
  | limit == 3 = (Pos c1 r1) : []
  | otherwise = (Pos c1 r1) : suedWest' (Pos (pred c1) (r1 - 1)) (limit + 1)
nordWest' :: Pos -> Int -> [Pos]
nordWest' (Pos c1 r1) limit
  | c1 == 'a' || r1 == 9 = (Pos c1 r1) : []
  | limit == 3 = (Pos c1 r1) : []
  | otherwise = (Pos c1 r1) : nordWest' (Pos (pred c1) (r1 + 1)) (limit + 1)

nordOst'' :: Pos -> Int -> [Pos]
nordOst'' (Pos c1 r1) limit
  | c1 == 'i' || r1 == 9 = (Pos c1 r1) : []
  | limit == 1 = (Pos c1 r1) : []
  | otherwise = (Pos c1 r1) : nordOst'' (Pos (succ c1) (r1 + 1)) (limit + 1)
suedOst'' :: Pos -> Int -> [Pos]
suedOst'' (Pos c1 r1) limit
  | c1 == 'i' || r1 == 1 = (Pos c1 r1) : []
  | limit == 1 = (Pos c1 r1) : []
  | otherwise = (Pos c1 r1) : suedOst'' (Pos (succ c1) (r1 - 1)) (limit + 1)
suedWest'' :: Pos -> Int -> [Pos]
suedWest'' (Pos c1 r1) limit
  | c1 == 'a' || r1 == 1 = (Pos c1 r1) : []
  | limit == 1 = (Pos c1 r1) : []
  | otherwise = (Pos c1 r1) : suedWest'' (Pos (pred c1) (r1 - 1)) (limit + 1)
nordWest'' :: Pos -> Int -> [Pos]
nordWest'' (Pos c1 r1) limit
  | c1 == 'a' || r1 == 9 = (Pos c1 r1) : []
  | limit == 1 = (Pos c1 r1) : []
  | otherwise = (Pos c1 r1) : nordWest'' (Pos (pred c1) (r1 + 1)) (limit + 1)

getPositionsOne :: Pos -> String -> [Pos]
getPositionsOne (Pos a b) dir
    |dir == "Nord" = tail $ line (Pos a b) (Pos a (b+1))
    |dir == "NordOst" = tail $ nordOst'' (Pos a b) 0
    |dir == "Ost" = tail $ line (Pos a b) (Pos (succ a) b)
    |dir == "SuedOst" = tail $ suedOst'' (Pos a b) 0
    |dir == "Sued" = tail $ line (Pos a b) (Pos a (b-1))
    |dir == "SuedWest" = tail $ suedWest'' (Pos a b) 0
    |dir == "West" = tail $ line (Pos a b) (Pos (pred a) b)
    |dir == "NordWest" = tail $ nordWest'' (Pos a b) 0
    |otherwise = []
getPositionsTwo :: Pos -> String -> [Pos]
getPositionsTwo (Pos a b) dir
    |dir == "Nord" = tail $ line (Pos a b) (Pos a (b+2))
    |dir == "NordOst" = tail $ nordOst (Pos a b) 0
    |dir == "Ost" = tail $ line (Pos a b) (Pos (succ (succ a)) b)
    |dir == "SuedOst" = tail $ suedOst (Pos a b) 0
    |dir == "Sued" = tail $ line (Pos a b) (Pos a (b-2))
    |dir == "SuedWest" = tail $ suedWest (Pos a b) 0
    |dir == "West" = tail $ line (Pos a b) (Pos (pred (pred a)) b)
    |dir == "NordWest" = tail $ nordWest (Pos a b) 0
    |otherwise = []
getPositionsThree :: Pos -> String -> [Pos]
getPositionsThree (Pos a b) dir
    |dir == "Nord" = tail $ line (Pos a b) (Pos a (b+3))
    |dir == "NordOst" = tail $ nordOst' (Pos a b) 0
    |dir == "Ost" = tail $ line (Pos a b) (Pos (succ (succ (succ a))) b)
    |dir == "SuedOst" = tail $ suedOst' (Pos a b) 0
    |dir == "Sued" = tail $ line (Pos a b) (Pos a (b-3))
    |dir == "SuedWest" = tail $ suedWest' (Pos a b) 0
    |dir == "West" = tail $ line (Pos a b) (Pos (pred (pred (pred a))) b)
    |dir == "NordWest" = tail $ nordWest' (Pos a b) 0
    |otherwise = []
--takes a Piece and a startingpos and returns all positions this piece can reach
accumulatePositionsOne :: Cell -> Pos -> [Pos]
accumulatePositionsOne cl (Pos a b) = concat ( [(getPositionsOne (Pos a b) x) | x <- (pieceDirections cl)] )
accumulatePositionsTwo :: Cell -> Pos -> [Pos]
accumulatePositionsTwo cl (Pos a b) = concat ( [(getPositionsTwo (Pos a b) x) | x <- (pieceDirections cl)] )
accumulatePositionsThree :: Cell -> Pos -> [Pos]
accumulatePositionsThree cl (Pos a b) = concat ( [(getPositionsThree (Pos a b) x) | x <- (pieceDirections cl)] )
--take a starting Pos and a list of Pos's and return a List of corresponding moves 
positionsToMoves :: Pos -> [Pos] -> [Move]
positionsToMoves start xs = [ (Move start end 0) | end <- xs ]
addTurnsToMove :: Move -> Int -> [Move]
addTurnsToMove (Move (Pos a1 b1) (Pos a2 b2) tn) ad
    | ad == 7 = (Move (Pos a1 b1) (Pos a2 b2) (mod (tn + ad) 8)) : []
    | otherwise = (Move (Pos a1 b1) (Pos a2 b2) (mod (tn + ad) 8)) : addTurnsToMove (Move (Pos a1 b1) (Pos a2 b2) tn) (ad + 1)
filterPred :: Move -> Bool
filterPred (Move (Pos a b) (Pos c d) tn) = if tn `mod` 2 == 0 then False else True
filterMoves :: [Move] -> [Move]
filterMoves xs = filter filterPred xs
--takes all the possible pos's reachable by the piece mentioned before and the same starting pos from before and converts to all possible moves  
accumulateMovesProbe :: Cell -> Pos -> [Move]
accumulateMovesProbe cl start = ( positionsToMoves start (accumulatePositionsTwo cl start) ) ++ ( addTurnsToMove (Move start start 0) 0 )
accumulateMovesLance :: Cell -> Pos -> [Move]
accumulateMovesLance cl start = ( positionsToMoves start (accumulatePositionsThree cl start) ) ++ ( addTurnsToMove (Move start start 0) 0 )
accumulateMovesCommander :: Cell -> Pos -> [Move]
accumulateMovesCommander cl start = ( positionsToMoves start (accumulatePositionsOne cl start) ) ++ ( filterMoves (addTurnsToMove (Move start start 0) 0 ) )
accumulateMovesShield :: Cell -> Pos -> [Move]
accumulateMovesShield cl start = ( addTurnsToMove ( head ( positionsToMoves start (accumulatePositionsOne cl start) ) ) 0 ) ++ ( addTurnsToMove (Move start start 0) 0 )

possibleMoves :: Pos -> Cell -> [Move]
possibleMoves pos pc 
    |pc == Empty = []
    |isCommanderB pc || isCommanderW pc = accumulateMovesCommander pc pos
    |isShield pc = accumulateMovesShield pc pos \\ [(Move pos pos 0)]
    |isProbeOne pc = accumulateMovesProbe pc pos \\ [(Move pos pos 0), (Move pos pos 4)]
    |isProbe pc = accumulateMovesProbe pc pos \\ [(Move pos pos 0)]
    |isLance pc = accumulateMovesLance pc pos \\ [(Move pos pos 0)]
    |otherwise = []



-- #############################################################################
-- ############# IMPLEMENT listMoves :: Board -> Player -> [Move] ##############
-- ############# - 2 Implementation Points                        ##############
-- ############# - 1 Coverage Point                               ##############
-- #############################################################################

filterValidMoves :: Board -> Pos -> Cell -> [Move]
filterValidMoves brd ps cl
    |cl == Empty = []
    |otherwise = filter (isValidMove brd) (possibleMoves ps cl)

createIndexBoard :: Board -> [(Cell,Pos)]
createIndexBoard brd =  zip (concat brd) b where b = [(Pos 'a' 9),(Pos 'b' 9),(Pos 'c' 9),(Pos 'd' 9),(Pos 'e' 9),(Pos 'f' 9),(Pos 'g' 9),(Pos 'h' 9),(Pos 'i' 9),
                                                      (Pos 'a' 8),(Pos 'b' 8),(Pos 'c' 8),(Pos 'd' 8),(Pos 'e' 8),(Pos 'f' 8),(Pos 'g' 8),(Pos 'h' 8),(Pos 'i' 8),
                                                      (Pos 'a' 7),(Pos 'b' 7),(Pos 'c' 7),(Pos 'd' 7),(Pos 'e' 7),(Pos 'f' 7),(Pos 'g' 7),(Pos 'h' 7),(Pos 'i' 7),
                                                      (Pos 'a' 6),(Pos 'b' 6),(Pos 'c' 6),(Pos 'd' 6),(Pos 'e' 6),(Pos 'f' 6),(Pos 'g' 6),(Pos 'h' 6),(Pos 'i' 6),
                                                      (Pos 'a' 5),(Pos 'b' 5),(Pos 'c' 5),(Pos 'd' 5),(Pos 'e' 5),(Pos 'f' 5),(Pos 'g' 5),(Pos 'h' 5),(Pos 'i' 5),
                                                      (Pos 'a' 4),(Pos 'b' 4),(Pos 'c' 4),(Pos 'd' 4),(Pos 'e' 4),(Pos 'f' 4),(Pos 'g' 4),(Pos 'h' 4),(Pos 'i' 4),
                                                      (Pos 'a' 3),(Pos 'b' 3),(Pos 'c' 3),(Pos 'd' 3),(Pos 'e' 3),(Pos 'f' 3),(Pos 'g' 3),(Pos 'h' 3),(Pos 'i' 3),
                                                      (Pos 'a' 2),(Pos 'b' 2),(Pos 'c' 2),(Pos 'd' 2),(Pos 'e' 2),(Pos 'f' 2),(Pos 'g' 2),(Pos 'h' 2),(Pos 'i' 2),
                                                      (Pos 'a' 1),(Pos 'b' 1),(Pos 'c' 1),(Pos 'd' 1),(Pos 'e' 1),(Pos 'f' 1),(Pos 'g' 1),(Pos 'h' 1),(Pos 'i' 1)]

whiteField :: (Cell, Pos) -> Bool
whiteField (cl,ps) = if isWhite cl then True else False
blackField :: (Cell, Pos) -> Bool
blackField (cl,ps) = if isBlack cl then True else False 

whiteIndexBoard :: [(Cell,Pos)] -> [(Cell,Pos)]
whiteIndexBoard xs = filter (whiteField) xs
blackIndexBoard :: [(Cell,Pos)] -> [(Cell,Pos)]
blackIndexBoard xs = filter (blackField) xs

accumulateR :: Board -> (Cell, Pos) -> [Move]
accumulateR brd (cl,ps) = filterValidMoves brd ps cl

listMoves :: Board -> Player -> [Move]
listMoves brd pl 
    |gameFinished brd = []
    |pl == White = concat ( map (accumulateR brd) ( whiteIndexBoard (createIndexBoard brd) ) )
    |pl == Black = concat ( map (accumulateR brd) ( blackIndexBoard (createIndexBoard brd) ) ) 