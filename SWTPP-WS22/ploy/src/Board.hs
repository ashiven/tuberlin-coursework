module Board where  -- do NOT CHANGE export of module

-- IMPORTS HERE
-- Note: Imports allowed that DO NOT REQUIRE TO CHANGE package.yaml, e.g.:
--       import Data.Chars

import Data.List
import Data.List.Split

-- #############################################################################
-- ############# GIVEN IMPLEMENTATION                           ################
-- ############# Note: "deriving Show" may be deleted if needed ################
-- #############       Given data types may NOT be changed      ################
-- #############################################################################

data Player = Black | White deriving Show
data Cell = Piece Player Int | Empty deriving Show
data Pos = Pos { col :: Char, row :: Int } deriving Show
type Board = [[Cell]]

instance Eq Pos where
  (==) (Pos c1 r1) (Pos c2 r2) = (c1 == c2) && (r1 == r2)

instance Eq Player where
  (==) Black Black = True
  (==) White White = True
  (==) _ _ = False

instance Eq Cell where
  (==) Empty Empty = True
  (==) (Piece p1 i1) (Piece p2 i2) = p1 == p2 && i1 == i2 
  (==) _ _ = False

-- #############################################################################
-- ################# IMPLEMENT validateFEN :: String -> Bool ###################
-- ################## - 2 Implementation Points              ###################
-- ################## - 1 Coverage Point                     ###################
-- #############################################################################

splstr :: String -> [String]
splstr xs = split (dropDelims $ oneOf "/") xs

validateFEN :: String -> Bool
validateFEN "" = False
validateFEN xs = foldl (\acc x -> if length x /= compareLength then False else acc) True (map hallo (splstr xs))
    where compareLength = 17--2 * (length (splstr xs)) - 1



-- #############################################################################
-- ####################### buildBoard :: String -> Board #######################
-- ####################### - 3 Implementation Points     #######################
-- ####################### - 1 Coverage Point            #######################
-- #############################################################################

hallo :: String -> [String]
hallo "" = []
hallo xs = split(oneOf ",") xs

help :: String -> Cell
help ('b':xs) = ( Piece Black (read xs :: Int))
help ('w':xs) = ( Piece White (read xs :: Int))

create :: [String] -> [Cell]
create [] = []
create (",":xs) = create xs
create ("":xs) = Empty : create xs
create (x:xs) = help x : create xs

buildBoard :: String -> Board
buildBoard xs = map create (map hallo (splstr xs)) 



-- #############################################################################
-- ####################### line :: Pos -> Pos -> [Pos]  ########################
-- ####################### - 3 Implementation Points    ########################
-- ####################### - 1 Coverage Point           ########################
-- #############################################################################

--Pos1(A,B) Pos2(C,D)

--suedwest 
aBGreaterCD :: Pos -> Pos -> [Pos]
aBGreaterCD (Pos {col = c1, row = r1}) (Pos {col = c2, row = r2} )
  | c1 == c2 && r1 == r2 = (Pos {col = c2, row = r2}) : []
  | otherwise = (Pos {col = c1, row = r1}) : aBGreaterCD (Pos {col = pred c1, row = r1 - 1}) (Pos {col = c2, row = r2} )
--nordost
aBSmallerCD :: Pos -> Pos -> [Pos]
aBSmallerCD (Pos {col = c1, row = r1}) (Pos {col = c2, row = r2} )
  | c1 == c2 && r1 == r2 = (Pos {col = c2, row = r2}) : []
  | otherwise = (Pos {col = c1, row = r1}) : aBSmallerCD (Pos {col = succ c1, row = r1 + 1}) (Pos {col = c2, row = r2} )
--nordwest
aGreaterCBSmallerD :: Pos -> Pos -> [Pos]
aGreaterCBSmallerD (Pos {col = c1, row = r1}) (Pos {col = c2, row = r2} )
  | c1 == c2 && r1 == r2 = (Pos {col = c2, row = r2}) : []
  | otherwise = (Pos {col = c1, row = r1}) : aGreaterCBSmallerD (Pos {col = pred c1, row = r1 + 1}) (Pos {col = c2, row = r2} )
--suedost
aSmallerCBGreaterD :: Pos -> Pos -> [Pos]
aSmallerCBGreaterD (Pos {col = c1, row = r1}) (Pos {col = c2, row = r2} )
  | c1 == c2 && r1 == r2 = (Pos {col = c2, row = r2}) : []
  | otherwise = (Pos {col = c1, row = r1}) : aSmallerCBGreaterD (Pos {col = succ c1, row = r1 - 1}) (Pos {col = c2, row = r2} )
--oben
oben :: Pos -> Pos -> [Pos]
oben (Pos c1 r1) (Pos c2 r2 )
  | r1 == 9 = (Pos c1 r1) : []
  | c1 == c2 && r1 == r2 = (Pos c1 r1) : []
  | otherwise = (Pos c1 r1) : oben (Pos c1 (r1 + 1)) (Pos c2 r2)
--unten
unten :: Pos -> Pos -> [Pos]
unten (Pos c1 r1) (Pos c2 r2 )
  | r1 == 1 = (Pos c1 r1) : []
  | c1 == c2 && r1 == r2 = (Pos c1 r1) : []
  | otherwise = (Pos c1 r1) : unten (Pos c1 (r1 - 1)) (Pos c2 r2)
--links
links :: Pos -> Pos -> [Pos]
links (Pos c1 r1) (Pos c2 r2 )
  | c1 == 'a' = (Pos c1 r1) : []
  | c1 == c2 && r1 == r2 = (Pos c1 r1) : []
  | otherwise = (Pos c1 r1) : links (Pos (pred c1) r1) (Pos c2 r2)
--rechts
rechts :: Pos -> Pos -> [Pos]
rechts (Pos c1 r1) (Pos c2 r2 )
  | c1 == 'i' = (Pos c1 r1) : []
  | c1 == c2 && r1 == r2 = (Pos c1 r1) : []
  | otherwise = (Pos c1 r1) : rechts (Pos (succ c1) r1) (Pos c2 r2)

line :: Pos -> Pos -> [Pos]
line (Pos c1 r1) (Pos c2 r2 )
  | c1 == c2 && r1 == r2 = [(Pos {col = c1, row = r1})]
  | c1 > c2 && r1 > r2 = aBGreaterCD (Pos {col = c1, row = r1}) (Pos {col = c2, row = r2} )
  | c1 < c2 && r1 < r2 = aBSmallerCD (Pos {col = c1, row = r1}) (Pos {col = c2, row = r2} )
  | c1 > c2 && r1 < r2 = aGreaterCBSmallerD (Pos {col = c1, row = r1}) (Pos {col = c2, row = r2} )
  | c1 < c2 && r1 > r2 = aSmallerCBGreaterD (Pos {col = c1, row = r1}) (Pos {col = c2, row = r2} )
  | c1 == c2 && r1 < r2 = oben (Pos c1 r1) (Pos c2 r2 )
  | c1 == c2 && r1 > r2 = unten (Pos c1 r1) (Pos c2 r2 )
  | c1 > c2 && r1 == r2 = links (Pos c1 r1) (Pos c2 r2 )
  | c1 < c2 && r1 == r2 = rechts (Pos c1 r1) (Pos c2 r2 )

