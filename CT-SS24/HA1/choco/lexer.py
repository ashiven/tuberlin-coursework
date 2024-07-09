from dataclasses import dataclass
from enum import Enum, auto
from io import TextIOBase
from typing import Any, List, Optional, Union


class TokenKind(Enum):
    EOF = auto()

    # Newline
    NEWLINE = auto()

    # Indentation
    INDENT = auto()
    DEDENT = auto()

    # Commands
    CLASS = auto()
    DEF = auto()
    GLOBAL = auto()
    NONLOCAL = auto()
    PASS = auto()
    RETURN = auto()

    # Primary
    IDENTIFIER = auto()
    INTEGER = auto()
    STRING = auto()

    # Control-flow
    IF = auto()
    ELIF = auto()
    ELSE = auto()
    WHILE = auto()
    FOR = auto()
    IN = auto()

    # Symbols
    PLUS = auto()
    MINUS = auto()
    MUL = auto()
    DIV = auto()
    MOD = auto()
    ASSIGN = auto()
    LROUNDBRACKET = auto()
    RROUNDBRACKET = auto()
    COLON = auto()
    LSQUAREBRACKET = auto()
    RSQUAREBRACKET = auto()
    COMMA = auto()
    RARROW = auto()

    # Comparison Operators
    EQ = auto()
    NE = auto()
    LT = auto()
    GT = auto()
    LE = auto()
    GE = auto()
    IS = auto()

    # VALUES
    NONE = auto()
    TRUE = auto()
    FALSE = auto()

    # Logical operators
    OR = auto()
    AND = auto()
    NOT = auto()

    # TYPES
    OBJECT = auto()
    INT = auto()
    BOOL = auto()
    STR = auto()


@dataclass
class Token:
    kind: TokenKind
    value: Any = None
    offset: int = 0

    def __repr__(self) -> str:
        if self.kind is TokenKind.STRING:
            # Get the string with escaped characters.
            str2 = (
                self.value.replace("\\", "\\\\")
                .replace("\t", "\\t")
                .replace("\r", "\\r")
                .replace("\n", "\\n")
                .replace('"', '\\"')
            )
            return self.kind.name + ":" + str2
        else:
            return self.kind.name + (
                (":" + str(self.value)) if self.value is not None else "")


class Scanner:

    def __init__(self, stream: TextIOBase):
        """Create a new scanner.

        The scanner's input is a stream derived from a string or a file.

        # Lexing a string
        s = io.StringIO("1 + 2")
        Scanner(s)

        # Lexing a file
        s = open("file.choc")
        Scanner(s)

        :param stream: The stream of characters to be lexed.
        """
        self.stream: TextIOBase = stream
        self.buffer: Optional[str] = None  # A buffer of one character.
        self.offset = 0

    def peek(self) -> str:
        """Return the next character from input without consuming it.

        :return: The next character in the input stream or None at the end of the stream.
        """
        # A buffer of one character is used to store the last scanned character.
        # If the buffer is empty, it is filled with the next character from the input.
        if not self.buffer:
            self.buffer = self.consume()
        return self.buffer

    def consume(self):
        """Consume and return the next character from input.

        :return: The next character in the input stream or None at the end of the stream.
        """
        # If the buffer is full, we empty the buffer and return the character it contains.
        if self.buffer:
            c = self.buffer
            self.buffer = None
            return c
        
        c = self.stream.read(1)
        self.offset += 1

        # uncomment to discover incorrect offset assignments
        # print(c, self.offset)
        return c

class Tokenizer:

    def __init__(self, scanner: Scanner):
        self.scanner = scanner
        self.buffer: List[Token] = []  # A buffer of tokens
        self.is_new_line = True
        self.is_logical_line = False
        self.line_indent_lvl = 0  # How "far" we are inside the line, i.e. what column.
        # Resets after every end-of-line sequence.
        self.indent_stack = [0]

    def peek(self, k: int = 1) -> Union[Token, List[Token]]:
        """Peeks through the next `k` number of tokens.

        This functions looks ahead the next `k` number of tokens,
        and returns them as a list.
        It uses a FIFO buffer to store tokens temporarily.
        :param k: number of tokens
        :return: one token or a list of tokens
        """
        if not self.buffer:
            self.buffer = [self.consume()]

        # Fill the buffer up to `k` tokens, if needed.
        buffer_size = len(self.buffer)
        if buffer_size < k:
            for _ in list(range(k - buffer_size)):
                self.buffer.append(self.consume(keep_buffer=True))

        # If you need only one token, return it as an element,
        # not as a list with one element.
        if k == 1:
            return self.buffer[0]

        return self.buffer[0:k]

    def consume(self, keep_buffer: bool = False) -> Token:
        """Consumes one token and implements peeking through the next one.

        If we want to only peek and not consume, we set the `keep_buffer` flag.
        This argument is passed to additional calls to `next`.
        The idea is that we can peek through more than one tokens (by keeping them in the buffer),
        but we consume tokens only one by one.
        :param keep_buffer: whether to keep the buffer intact, or consume a token from it
        :return: one token
        """
        if self.buffer and not keep_buffer:
            c = self.buffer[0]
            self.buffer = self.buffer[1:]
            return c

        c = self.scanner.peek()

        while True:
            if c.isspace():
                # Tabs are replaced from left to right by one to eight spaces.
                # The total number of spaces up to and including the replacement should be a multiple of eight.
                if c == "\t":
                    if self.is_new_line:  # We only care about padding at the beginning of line.
                        self.line_indent_lvl += 8 - self.line_indent_lvl % 8
                elif c == "\n" or c == "\r":  # line feed handling and carriage return handling
                    self.line_indent_lvl = 0
                    self.is_new_line = True
                    if self.is_logical_line:
                        self.is_logical_line = False
                        self.scanner.consume()
                        return Token(TokenKind.NEWLINE, None, self.scanner.offset)
                else:  # Handle the rest whitespaces
                    if self.is_new_line:
                        self.line_indent_lvl += 1
                # Consume whitespace
                self.scanner.consume()
                return self.consume(keep_buffer)
            # One line comments
            # get_char() returns None in the case of EOF.
            elif c == '#':
                self.scanner.consume()
                c = self.scanner.peek()
                while c and c != "\n" and c != "\r":
                    self.scanner.consume()
                    c = self.scanner.peek()
                continue
            # Indentation
            elif c and not c.isspace() and c != "#" and self.is_new_line:
                # OK, we are in a logical line now (at least one token that is not whitespace or comment).
                self.is_logical_line = True
                if (
                    self.line_indent_lvl > self.indent_stack[-1]
                ):  # New indentation level
                    # Push the indentation level to the stack.
                    self.indent_stack.append(self.line_indent_lvl)
                    # Return indent token.
                    # Do not consume any character (this will happen in the next call of get_token()).
                    indent_offset = 0
                    if len(self.indent_stack) > 1:
                        indent_offset = self.indent_stack[-1] - self.indent_stack[-2]
                    return Token(TokenKind.INDENT, None, self.scanner.offset - indent_offset)
                elif (
                    self.line_indent_lvl < self.indent_stack[-1]
                ):  # Previous indentation level is (probably) closing.
                    try:
                        self.indent_stack.index(self.line_indent_lvl)
                        # Pop the last of the indentation levels that are higher.
                        self.indent_stack = self.indent_stack[0:-1]
                        # Return dedent token.
                        # Do not consume any character (this will happen in a next call of get_token()).
                        # Note that the token offset here is probably incorrect but it is not used (for now).
                        dedent_offset = 0
                        if len(self.indent_stack) > 1:
                            dedent_offset = self.indent_stack[-1] - self.indent_stack[-2]
                        return Token(TokenKind.DEDENT, None, self.scanner.offset - dedent_offset)
                    except ValueError:
                        print("Indentation error: mismatched blocks.")
                        exit(1)
                self.is_new_line = False
            elif c == "+":
                self.scanner.consume()
                return Token(TokenKind.PLUS, "+", self.scanner.offset)
            elif c == "-":
                self.scanner.consume()
                c += self.scanner.peek()
                if c == "->":
                    self.scanner.consume()
                    return Token(TokenKind.RARROW, "->", self.scanner.offset - 1)
                else:
                    return Token(TokenKind.MINUS, "-", self.scanner.offset - 1)
            elif c == "*":
                self.scanner.consume()
                return Token(TokenKind.MUL, "*", self.scanner.offset)
            elif c == "%":
                self.scanner.consume()
                return Token(TokenKind.MOD, "%", self.scanner.offset)
            elif c == "/":
                self.scanner.consume()
                c += self.scanner.peek()
                if c == "//":
                    self.scanner.consume()
                    return Token(TokenKind.DIV, "//", self.scanner.offset - 1)
                else:
                    raise Exception("Unknown lexeme: {}".format(c))
            elif c == "=":
                self.scanner.consume()
                c += self.scanner.peek()
                if c == "==":
                    self.scanner.consume()
                    return Token(TokenKind.EQ, "==", self.scanner.offset - 1)
                else:
                    return Token(TokenKind.ASSIGN, "=", self.scanner.offset - 1)
            elif c == "!":
                self.scanner.consume()
                c += self.scanner.peek()
                if c == "!=":
                    self.scanner.consume()
                    return Token(TokenKind.NE, "!=", self.scanner.offset - 1)
                else:
                    raise Exception("Unknown lexeme: {}".format(c))
            elif c == "<":
                self.scanner.consume()
                c += self.scanner.peek()
                if c == "<=":
                    self.scanner.consume()
                    return Token(TokenKind.LE, "<=", self.scanner.offset - 1)
                else:
                    return Token(TokenKind.LT, "<", self.scanner.offset - 1)
            elif c == ">":
                self.scanner.consume()
                c += self.scanner.peek()
                if c == ">=":
                    self.scanner.consume()
                    return Token(TokenKind.GE, ">=", self.scanner.offset - 1)
                else:
                    return Token(TokenKind.GT, ">", self.scanner.offset - 1)
            elif c == "(":
                self.scanner.consume()
                return Token(TokenKind.LROUNDBRACKET, "(", self.scanner.offset)
            elif c == ")":
                self.scanner.consume()
                return Token(TokenKind.RROUNDBRACKET, ")", self.scanner.offset)
            elif c == ":":
                self.scanner.consume()
                return Token(TokenKind.COLON, ":", self.scanner.offset)
            elif c == "[":
                self.scanner.consume()
                return Token(TokenKind.LSQUAREBRACKET, "[", self.scanner.offset)
            elif c == "]":
                self.scanner.consume()
                return Token(TokenKind.RSQUAREBRACKET, "]", self.scanner.offset)
            elif c == ",":
                self.scanner.consume()
                return Token(TokenKind.COMMA, ",", self.scanner.offset)
            # Identifier: [a-zA-Z_][a-zA-Z0-9_]*
            elif c.isalpha() or c == "_":
                name = self.scanner.consume()
                c = self.scanner.peek()
                while c.isalnum() or c == "_":
                    name += self.scanner.consume()
                    c = self.scanner.peek()

                if name == "class":
                    return Token(TokenKind.CLASS, "class", self.scanner.offset - len(name))
                if name == "def":
                    return Token(TokenKind.DEF, "def", self.scanner.offset - len(name))
                if name == "global":
                    return Token(TokenKind.GLOBAL, "global", self.scanner.offset - len(name))
                if name == "nonlocal":
                    return Token(TokenKind.NONLOCAL, "nonlocal", self.scanner.offset - len(name))
                if name == "if":
                    return Token(TokenKind.IF, "if", self.scanner.offset - len(name))
                if name == "elif":
                    return Token(TokenKind.ELIF, "elif", self.scanner.offset - len(name))
                if name == "else":
                    return Token(TokenKind.ELSE, "else", self.scanner.offset - len(name))
                if name == "while":
                    return Token(TokenKind.WHILE, "while", self.scanner.offset - len(name))
                if name == "for":
                    return Token(TokenKind.FOR, "for", self.scanner.offset - len(name))
                if name == "in":
                    return Token(TokenKind.IN, "in", self.scanner.offset - len(name))
                if name == "None":
                    return Token(TokenKind.NONE, "None", self.scanner.offset - len(name))
                if name == "True":
                    return Token(TokenKind.TRUE, "True", self.scanner.offset - len(name))
                if name == "False":
                    return Token(TokenKind.FALSE, "False", self.scanner.offset - len(name))
                if name == "pass":
                    return Token(TokenKind.PASS, "pass", self.scanner.offset - len(name))
                if name == "or":
                    return Token(TokenKind.OR, "or", self.scanner.offset - len(name))
                if name == "and":
                    return Token(TokenKind.AND, "and", self.scanner.offset - len(name))
                if name == "not":
                    return Token(TokenKind.NOT, "not", self.scanner.offset - len(name))
                if name == "is":
                    return Token(TokenKind.IS, "is", self.scanner.offset - len(name))
                if name == "object":
                    return Token(TokenKind.OBJECT, "object", self.scanner.offset - len(name))
                if name == "int":
                    return Token(TokenKind.INT, "int", self.scanner.offset - len(name))
                if name == "bool":
                    return Token(TokenKind.BOOL, "bool", self.scanner.offset - len(name))
                if name == "str":
                    return Token(TokenKind.STR, "str", self.scanner.offset - len(name))
                if name == "return":
                    return Token(TokenKind.RETURN, "return", self.scanner.offset - len(name))

                return Token(TokenKind.IDENTIFIER, name, self.scanner.offset - len(name))
            # Number: [0-9]+
            elif c.isdigit():
                value = self.scanner.consume()
                while self.scanner.peek().isnumeric():
                    value += self.scanner.consume()
                return Token(TokenKind.INTEGER, int(value), self.scanner.offset - len(value))
            # String
            elif c == '"':
                string: str = ""
                self.scanner.consume()
                c = self.scanner.peek()
                while c != '"':
                    if 32 <= ord(c) <= 126:  # ASCII limits accepted
                        if c != "\\":
                            string += self.scanner.consume()
                        # Handle escape characters
                        else:
                            self.scanner.consume()  # Consume '\\'
                            c = self.scanner.peek()
                            if c == "n":
                                string += "\n"
                            elif c == "t":
                                string += "\t"
                            elif c == '"':
                                string += '"'
                            elif c == "\\":
                                string += "\\"
                            else:
                                print('Error: "\\{}" not recognized'.format(c))
                                exit(1)
                            self.scanner.consume()  # Consume escaped character
                    else:
                        print("Error: Unknown ASCII number {}".format(ord(c)))
                        exit(1)
                    c = self.scanner.peek()
                self.scanner.consume()
                return Token(TokenKind.STRING, string, self.scanner.offset - len(string) - 1)
            # End of file
            elif not c:
                # The end of input also serves as an implicit terminator of the physical line.
                # For a logical line emit a newline token.
                if self.is_logical_line:
                    self.is_logical_line = False
                    return Token(TokenKind.NEWLINE, None, self.scanner.offset)
                if (
                    self.indent_stack[-1] > 0
                ):  # A dedent token is generated for the rest non-zero numbers on the stack.
                    self.indent_stack = self.indent_stack[0:-1]
                    dedent_offset = 0
                    if len(self.indent_stack) > 1:
                        dedent_offset = self.indent_stack[-1] - self.indent_stack[-2]
                    return Token(TokenKind.DEDENT, None, self.scanner.offset - dedent_offset)
                return Token(TokenKind.EOF, None, self.scanner.offset)
            else:
                raise Exception("Invalid character detected: '" + c + "'")


class Lexer:
    def __init__(self, stream: TextIOBase):
        scanner = Scanner(stream)
        self.tokenizer = Tokenizer(scanner)

    def peek(self, k: int = 1) -> Union[Token, List[Token]]:
        return self.tokenizer.peek(k)

    def consume(self) -> Token:
        return self.tokenizer.consume()
