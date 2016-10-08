(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
    typeof define === 'function' && define.amd ? define(factory) :
    (global.kp = factory());
}(this, (function () { 'use strict';

/**
 * A "clean", empty container. Instantiating this is faster than explicitly calling `Object.create( null )`.
 * @class Null
 * @extends external:null
 */
function Null(){}
Null.prototype = Object.create( null );
Null.prototype.constructor =  Null;

var tokenId = 0;

/**
 * @class Lexer~Token
 * @extends Null
 * @param {external:string} type The type of the token
 * @param {external:string} value The value of the token
 * @throws {external:TypeError} If `type` is not a string
 * @throws {external:TypeError} If `value` is not a string
 */
function Token( type, value ){
    if( typeof type !== 'string' ){
        throw new TypeError( 'type must be a string' );
    }
    
    if( typeof value !== 'string' ){
        throw new TypeError( 'value must be a string' );
    }
    
    /**
     * @member {external:number} Lexer~Token#id
     */
    this.id = ++tokenId;
    /**
     * @member {external:string} Lexer~Token#type
     */
    this.type = type;
    /**
     * @member {external:string} Lexer~Token#value
     */
    this.value = value;
    /**
     * The length of the token value
     * @member {external:number} Lexer~Token#length
     */
    this.length = value.length;
}

Token.prototype = new Null();

Token.prototype.constructor = Token;

/**
 * @function
 * @returns {external:Object} A JSON representation of the token
 */
Token.prototype.toJSON = function(){
    var json = new Null();
    
    json.type = this.type;
    json.value = this.value;
    
    return json;
};

/**
 * @function
 * @returns {external:string} A string representation of the token
 */
Token.prototype.toString = function(){
    return String( this.value );
};

/**
 * @class Lexer~Identifier
 * @extends Lexer~Token
 * @param {external:string} value
 */
function Identifier( value ){
    Token.call( this, 'identifier', value );
}

Identifier.prototype = Object.create( Token.prototype );

Identifier.prototype.constructor = Identifier;

/**
 * @class Lexer~Literal
 * @extends Lexer~Token
 * @param {external:string} value
 */
function Literal( value ){
    Token.call( this, 'literal', value );
}

Literal.prototype = Object.create( Token.prototype );

Literal.prototype.constructor = Literal;

/**
 * @class Lexer~Punctuator
 * @extends Lexer~Token
 * @param {external:string} value
 */
function Punctuator( value ){
    Token.call( this, 'punctuator', value );
}

Punctuator.prototype = Object.create( Token.prototype );

Punctuator.prototype.constructor = Punctuator;

/**
 * @function Lexer~isIdentifier
 * @param {external:string} char
 * @returns {external:boolean} Whether or not the character is an identifier character
 */
function isIdentifier( char ){
    return 'a' <= char && char <= 'z' || 'A' <= char && char <= 'Z' || '_' === char || char === '$';
}

/**
 * @function Lexer~isNumeric
 * @param {external:string} char
 * @returns {external:boolean} Whether or not the character is a numeric character
 */
function isNumeric( char ){
    return '0' <= char && char <= '9';
}

/**
 * @function Lexer~isPunctuator
 * @param {external:string} char
 * @returns {external:boolean} Whether or not the character is a punctuator character
 */
function isPunctuator( char ){
    return char === '.' || char === '(' || char === ')' || char === '[' || char === ']' || char === ',' || char === '%';
}

/**
 * @function Lexer~isQuote
 * @param {external:string} char
 * @returns {external:boolean} Whether or not the character is a quote character
 */
function isQuote( char ){
    return char === '"' || char === "'";
}

/**
 * @function Lexer~isWhitespace
 * @param {external:string} char
 * @returns {external:boolean} Whether or not the character is a whitespace character
 */
function isWhitespace( char ){
    return char === ' ' || char === '\r' || char === '\t' || char === '\n' || char === '\v' || char === '\u00A0';
}

/**
 * @class Lexer~LexerError
 * @extends external:SyntaxError
 * @param {external:string} message The error message
 */
function LexerError( message ){
    SyntaxError.call( this, message );    
}

LexerError.prototype = Object.create( SyntaxError.prototype );

/**
 * @class Lexer
 * @extends Null
 */
function Lexer(){
    this.buffer = '';
}

Lexer.prototype = new Null();

Lexer.prototype.constructor = Lexer;

/**
 * @function
 * @param {external:string} text
 */
Lexer.prototype.lex = function( text ){
    /**
     * @member {external:string}
     * @default ''
     */
    this.buffer = text;
    /**
     * @member {external:number}
     */
    this.index = 0;
    /**
     * @member {Array<Lexer~Token>}
     */
    this.tokens = [];
    
    var length = this.buffer.length,
        word = '',
        char, quote;
    
    while( this.index < length ){
        char = this.buffer[ this.index ];
        
        // Identifier
        if( isIdentifier( char ) ){
            word = this.read( function( char ){
                return !isIdentifier( char ) && !isNumeric( char );
            } );
            
            this.tokens.push( new Identifier( word ) );
        
        // Punctuator
        } else if( isPunctuator( char ) ){
            this.tokens.push( new Punctuator( char ) );
            this.index++;
        
        // Quoted String
        } else if( isQuote( char ) ){
            quote = char;
            
            this.index++;
            
            word = this.read( function( char ){
                return char === quote;
            } );
            
            this.tokens.push( new Literal( quote + word + quote ) );
            
            this.index++;
        
        // Numeric
        } else if( isNumeric( char ) ){
            word = this.read( function( char ){
                return !isNumeric( char );
            } );
            
            this.tokens.push( new Literal( word ) );
        
        // Whitespace
        } else if( isWhitespace( char ) ){
            this.index++;
        
        // Error
        } else {
            this.throwError( '"' + char + '" is an invalid character' );
        }
        
        word = '';
    }
    
    return this.tokens;
};

/**
 * @function
 * @param {external:function} until A condition that when met will stop the reading of the buffer
 * @returns {external:string} The portion of the buffer read
 */
Lexer.prototype.read = function( until ){
    var start = this.index,
        char;
    
    while( this.index < this.buffer.length ){
        char = this.buffer[ this.index ];
        
        if( until( char ) ){
            break;
        }
        
        this.index++;
    }
    
    return this.buffer.slice( start, this.index );
};

/**
 * @function
 * @throws {Lexer~LexerError} When it executes
 */
Lexer.prototype.throwError = function( message ){
    throw new LexerError( message );
};

/**
 * @function
 * @returns {external:Object} A JSON representation of the lexer
 */
Lexer.prototype.toJSON = function(){
    var json = new Null();
    
    json.buffer = this.buffer;
    json.tokens = this.tokens.map( function( token ){
        return token.toJSON();
    } );
    
    return json;
};

/**
 * @function
 * @returns {external:string} A string representation of the lexer
 */
Lexer.prototype.toString = function(){
    return this.buffer;
};

function Position( line, column ){
    if( typeof line !== 'number' || line < 1 ){
        throw new TypeError( 'line must be a positive number' );
    }
    
    if( typeof column !== 'number' || column < 0 ){
        throw new TypeError( 'column must be a positive number or 0' );
    }
    
    this.line = line;
    this.column = column;
}

Position.prototype = new Null();

Position.prototype.constructor = Position;

Position.prototype.toJSON = function(){
    var json = new Null();
    
    json.line = this.line;
    json.column = this.column;
    
    return json;
};

Position.prototype.toString = function(){
    return this.line + ',' + this.column;
};

function SourceLocation( start, end ){
    if( !( start instanceof Position ) ){
        throw new TypeError( 'start must be a position' );
    }
    
    if( !( end instanceof Position ) ){
        throw new TypeError( 'end must be a position' );
    }
    
    this.source = null;
    this.start = start;
    this.end = end;
}

SourceLocation.prototype = new Null();

SourceLocation.prototype.constructor = SourceLocation;

SourceLocation.prototype.toJSON = function(){
    var json = new Null();
    
    json.start = this.start.toJSON();
    json.end = this.end.toJSON();
    
    return json;
};

SourceLocation.prototype.toString = function(){
    return this.start.toString() + ':' + this.end.toString();
};

var nodeId = 0;

/**
 * @typedef {external:string} Builder~NodeType
 */

/**
 * @class Builder~Node
 * @extends Null
 * @param {Builder~NodeType} type A node type
 */
function Node( type, location ){
    
    if( typeof type !== 'string' ){
        throw new TypeError( 'type must be a string' );
    }
    
    if( arguments.length > 1 && !( location instanceof SourceLocation ) ){
        throw new TypeError( 'location must be an instance of SourceLocation' );
    }
    
    /**
     * @member {external:number} Builder~Node#id
     */
    this.id = ++nodeId;
    /**
     * @member {Builder~NodeType} Builder~Node#type
     */
    this.type = type;
    
    this.loc = location || null;
}

Node.prototype = new Null();

Node.prototype.constructor = Node;

/**
 * @function
 * @returns {external:Object} A JSON representation of the node
 */
Node.prototype.toJSON = function(){
    const json = new Null();
    
    json.loc = this.loc.toJSON();
    json.type = this.type;
    
    return json;
};

/**
 * @function
 * @returns {external:string} A string representation of the node
 */
Node.prototype.toString = function(){
    return String( this.type );
};

Node.prototype.valueOf = function(){
    return this.id;
};

/**
 * @class Builder~Statement
 * @extends Builder~Node
 * @param {Builder~NodeType} statementType A node type
 */
function Statement( statementType, location ){
    Node.call( this, statementType, location );
}

Statement.prototype = Object.create( Node.prototype );

Statement.prototype.constructor = Statement;

/**
 * @class Builder~Expression
 * @extends Builder~Node
 * @param {Builder~NodeType} expressionType A node type
 */
function Expression( expressionType, location ){
    Node.call( this, expressionType, location );
}

Expression.prototype = Object.create( Node.prototype );

Expression.prototype.constructor = Expression;

/**
 * @class Builder~Program
 * @extends Builder~Node
 * @param {external:Array<Builder~Statement>} body
 */
function Program( body ){
    var start = body.length ?
            body[ 0 ].loc.start :
            new Position( 1, 0 ),
        end = body.length ?
            body[ body.length - 1 ].loc.end :
            new Position( 1, 1 ),
        location = new SourceLocation( start, end );
        
    Node.call( this, 'Program', location );
    
    if( !Array.isArray( body ) ){
        throw new TypeError( 'body must be an array' );
    }
    
    /**
     * @member {external:Array<Builder~Statement>}
     */
    this.body = body || [];
}

Program.prototype = Object.create( Node.prototype );

Program.prototype.constructor = Program;

/**
 * @function
 * @returns {external:Object} A JSON representation of the program
 */
Program.prototype.toJSON = function(){
    const json = Node.prototype.toJSON.call( this );
    
    json.body = this.body.map( ( node ) => node.toJSON() );
    
    return json;
};

/**
 * @class Builder~ArrayExpression
 * @extends Builder~Expression
 * @param {external:Array<Builder~Expression>} elements A list of expressions
 */
function ArrayExpression( elements, location ){
    Expression.call( this, 'ArrayExpression', location );
    
    if( !( Array.isArray( elements ) ) ){
        throw new TypeError( 'elements must be a list of expressions' );
    }
    
    /**
     * @member {Array<Builder~Expression>}
     */
    this.elements = elements;
}

ArrayExpression.prototype = Object.create( Expression.prototype );

ArrayExpression.prototype.constructor = ArrayExpression;

/**
 * @function
 * @returns {external:Object} A JSON representation of the array expression
 */
ArrayExpression.prototype.toJSON = function(){
    const json = Node.prototype.toJSON.call( this );
    
    json.elements = this.elements.map( function( element ){
        return element.toJSON();
    } );
    
    return json;
};

/**
 * @class Builder~ExpressionStatement
 * @extends Builder~Statement
 */
function ExpressionStatement( expression ){
    var start = expression.loc.start,
        end = expression.loc.end,
        location = new SourceLocation( start, end );
        
    Statement.call( this, 'ExpressionStatement', location );
    
    if( !( expression instanceof Expression ) ){
        throw new TypeError( 'argument must be an expression' );
    }
    
    /**
     * @member {Builder~Expression}
     */
    this.expression = expression;
}

ExpressionStatement.prototype = Object.create( Statement.prototype );

ExpressionStatement.prototype.constructor = ExpressionStatement;

/**
 * @function
 * @returns {external:Object} A JSON representation of the expression statement
 */
ExpressionStatement.prototype.toJSON = function(){
    const json = Node.prototype.toJSON.call( this );
    
    json.expression = this.expression.toJSON();
    
    return json;
};

/**
 * @class Builder~CallExpression
 * @extends Builder~Expression
 * @param {Builder~Expression} callee
 * @param {Array<Builder~Expression>} args
 */
function CallExpression( callee, args, location ){
    Expression.call( this, 'CallExpression', location );
    
    if( !Array.isArray( args ) ){
        throw new TypeError( 'arguments must be an array' );
    }
    
    /**
     * @member {Builder~Expression}
     */
    this.callee = callee;
    /**
     * @member {Array<Builder~Expression>}
     */
    this.arguments = args;
}

CallExpression.prototype = Object.create( Expression.prototype );

CallExpression.prototype.constructor = CallExpression;

/**
 * @function
 * @returns {external:Object} A JSON representation of the call expression
 */
CallExpression.prototype.toJSON = function(){
    const json = Node.prototype.toJSON.call( this );
    
    json.callee    = this.callee.toJSON();
    json.arguments = this.arguments.map( ( node ) => node.toJSON() );
    
    return json;
};

/**
 * @class Builder~MemberExpression
 * @extends Builder~Expression
 * @param {Builder~Expression} object
 * @param {Builder~Expression|Builder~Identifier} property
 * @param {external:boolean} computed=false
 */
function MemberExpression( object, property, computed, location ){
    Expression.call( this, 'MemberExpression', location );
    
    if( computed ){
        if( !( property instanceof Expression ) ){
            throw new TypeError( 'property must be an expression when computed is true' );
        }
    } else {
        if( !( property instanceof Identifier$1 ) ){
            throw new TypeError( 'property must be an identifier when computed is false' );
        }
    }
    
    /**
     * @member {Builder~Expression}
     */
    this.object = object;
    /**
     * @member {Builder~Expression|Builder~Identifier}
     */
    this.property = property;
    /**
     * @member {external:boolean}
     */
    this.computed = computed || false;
}

MemberExpression.prototype = Object.create( Expression.prototype );

MemberExpression.prototype.constructor = MemberExpression;

/**
 * @function
 * @returns {external:Object} A JSON representation of the member expression
 */
MemberExpression.prototype.toJSON = function(){
    const json = Node.prototype.toJSON.call( this );
    
    json.object   = this.object.toJSON();
    json.property = this.property.toJSON();
    json.computed = this.computed;
    
    return json;
};

/**
 * @class Builder~Identifier
 * @extends Builder~Expression
 * @param {external:string} name The name of the identifier
 */
function Identifier$1( name, location ){
    Expression.call( this, 'Identifier', location );
    
    if( typeof name !== 'string' ){
        throw new TypeError( 'name must be a string' );
    }
    
    /**
     * @member {external:string}
     */
    this.name = name;
}

Identifier$1.prototype = Object.create( Expression.prototype );

Identifier$1.prototype.constructor = Identifier$1;

/**
 * @function
 * @returns {external:Object} A JSON representation of the identifier
 */
Identifier$1.prototype.toJSON = function(){
    const json = Node.prototype.toJSON.call( this );
    
    json.name = this.name;
    
    return json;
};

/**
 * @class Builder~Literal
 * @extends Builder~Expression
 * @param {external:string|external:number} value The value of the literal
 */
function Literal$1( value, location ){
    Expression.call( this, 'Literal', location );
    
    const type = typeof value;
    
    if( 'boolean number string'.split( ' ' ).indexOf( type ) === -1 && value !== null && !( value instanceof RegExp ) ){
        throw new TypeError( 'value must be a boolean, number, string, null, or instance of RegExp' );
    }
    
    /**
     * @member {external:string|external:number}
     */
    this.value = value;
}

Literal$1.prototype = Object.create( Expression.prototype );

Literal$1.prototype.constructor = Literal$1;

/**
 * @function
 * @returns {external:Object} A JSON representation of the literal
 */
Literal$1.prototype.toJSON = function(){
    const json = Node.prototype.toJSON.call( this );
    
    json.value = this.value;
    
    return json;
};

/**
 * @class Builder~SequenceExpression
 * @extends Builder~Expression
 * @param {Array<Builder~Expression>} expressions The expressions in the sequence
 */
function SequenceExpression( expressions, location ){
    Expression.call( this, 'SequenceExpression', location );
    
    if( !( Array.isArray( expressions ) ) ){
        throw new TypeError( 'expressions must be a list of expressions' );
    }
    
    /**
     * @member {Array<Builder~Expression>}
     */
    this.expressions = expressions;
}

SequenceExpression.prototype = Object.create( Expression.prototype );

SequenceExpression.prototype.constructor = SequenceExpression;

/**
 * @function
 * @returns {external:Object} A JSON representation of the sequence expression
 */
SequenceExpression.prototype.toJSON = function(){
    const json = Node.prototype.toJSON.call( this );
    
    json.expressions = this.expressions.map( function( expression ){
        return expression.toJSON();
    } );
    
    return json;
};

/**
 * @class Builder~Punctuator
 * @extends Builder~Node
 * @param {external:string} value
 */

/**
 * @class Builder
 * @extends Null
 * @param {Lexer} lexer
 */
function Builder( lexer ){
    if( !arguments.length ){
        throw new TypeError( 'lexer must be provided' );
    }
    
    this.lexer = lexer;
}

Builder.prototype = new Null();

Builder.prototype.constructor = Builder;

Builder.prototype.arrayExpression = function( list ){
    var // "+ 1" to take the ']' into account
        end = new Position( this.line, list[ list.length - 1 ].loc.end.column + 1 ),
        location, start;
    
    this.consume( '[' );
    
    start = new Position( this.line, this.column );
    location = new SourceLocation( start, end );
    
    return new ArrayExpression( list, location );
};

/**
 * @function
 * @param {external:string} text
 * @returns {Program} The built abstract syntax tree
 */
Builder.prototype.build = function( text ){
    /**
     * @member {external:string}
     */
    this.text = text;
    /**
     * @member {external:Array<Token>}
     */
    this.tokens = this.lexer.lex( text );
    
    //console.log( 'BUILD' );
    //console.log( '- ', this.text.length, 'CHARS', this.text );
    //console.log( '- ', this.tokens.length, 'TOKENS', this.tokens );
    
    this.column = this.tokens.length;
    
    var program = this.program();
    
    if( this.tokens.length ){
        this.throwError( 'Unexpected token ' + this.tokens[ 0 ] + ' remaining' );
    }
    
    return program;
};

/**
 * @function
 * @returns {CallExpression} The call expression node
 */
Builder.prototype.callExpression = function(){
    var // "+ 1" to take the ')' into account
        end = new Position( this.line, this.column + 1 ),
        args = this.list( '(' ),
        callee, location, start;
        
    this.consume( '(' );
    
    callee = this.expression();
    
    start = callee === null ?
        new Position( this.line, this.column ) :
        callee.loc.start;
    
    //console.log( 'CALL EXPRESSION' );
    //console.log( '- CALLEE', callee );
    //console.log( '- ARGUMENTS', args, args.length );
    
    location = new SourceLocation( start, end );
    
    return new CallExpression( callee, args, location );
};

/**
 * Removes the next token in the token list. If a comparison is provided, the token will only be returned if the value matches. Otherwise an error is thrown.
 * @function
 * @param {external:string} [expected] An expected comparison value
 * @returns {Token} The next token in the list
 * @throws {SyntaxError} If token did not exist
 */
Builder.prototype.consume = function( expected ){
    if( !this.tokens.length ){
        this.throwError( 'Unexpected end of expression' );
    }
    
    var token = this.expect( expected );
    
    if( !token ){
        this.throwError( 'Unexpected token ' + token.value + ' consumed' );
    }
    
    return token;
};

/**
 * Removes the next token in the token list. If comparisons are provided, the token will only be returned if the value matches one of the comparisons.
 * @function
 * @param {external:string} [first] The first comparison value
 * @param {external:string} [second] The second comparison value
 * @param {external:string} [third] The third comparison value
 * @param {external:string} [fourth] The fourth comparison value
 * @returns {Token} The next token in the list or `undefined` if it did not exist
 */
Builder.prototype.expect = function( first, second, third, fourth ){
    var token = this.peek( first, second, third, fourth );
    
    if( token ){
        this.tokens.pop();
        this.column--;
        return token;
    }
    
    return undefined;
};

/**
 * @function
 * @returns {Expression} An expression node
 */
Builder.prototype.expression = function(){
    var expression = null,
        list, next, token;
    
    if( next = this.peek() ){
        if( this.expect( ']' ) ){
            list = this.list( '[' );
            if( this.tokens.length === 1 ){
                expression = this.arrayExpression( list );
            } else if( list.length > 1 ){
                expression = this.sequenceExpression( list );
            } else {
                expression = list[ 0 ];
            }
        } else if( next.type === 'identifier' ){
            expression = this.identifier();
            next = this.peek();
            
            // Implied member expression
            if( next && next.type === 'punctuator' ){
                if( next.value === ')' || next.value === ']' ){
                    expression = this.memberExpression( expression, false );
                }
            }
        } else if( next.type === 'literal' ){
            expression = this.literal();
        }
        
        while( ( token = this.expect( ')', '[', '.' ) ) ){
            if( token.value === ')' ){
                expression = this.callExpression();
            } else if( token.value === '[' ){
                expression = this.memberExpression( expression, true );
            } else if( token.value === '.' ){
                expression = this.memberExpression( expression, false );
            } else {
                this.throwError( 'Unexpected token ' + token );
            }
        }
    }
    
    return expression;
};

/**
 * @function
 * @returns {ExpressionStatement} An expression statement
 */
Builder.prototype.expressionStatement = function(){
    return new ExpressionStatement( this.expression() );
};

/**
 * @function
 * @returns {Identifier} An identifier
 * @throws {SyntaxError} If the token is not an identifier
 */
Builder.prototype.identifier = function(){
    var end = new Position( this.line, this.column ),
        token = this.consume(),
        location, start;
    
    if( !( token.type === 'identifier' ) ){
        this.throwError( 'Identifier expected' );
    }
    
    start = new Position( this.line, this.column );
    location = new SourceLocation( start, end );
    
    return new Identifier$1( token.value, location );
};

/**
 * @function
 * @returns {Literal} The literal node
 */
Builder.prototype.literal = function(){
    var end = new Position( this.line, this.column ),
        token = this.consume(),
        literal, location, start, value;
    
    if( !( token.type === 'literal' ) ){
        this.throwError( 'Literal expected' );
    }
    
    value = token.value;

    literal = value[ 0 ] === '"' || value[ 0 ] === "'" ?
        // String Literal
        value.substring( 1, value.length - 1 ) :
        // Numeric Literal
        parseFloat( value );
    
    start = new Position( this.line, this.column );
    location = new SourceLocation( start, end );
    
    return new Literal$1( literal, location );
};

/**
 * @function
 * @param {external:string} terminator
 * @returns {external:Array<Literal>} The list of literals
 */
Builder.prototype.list = function( terminator ){
    var list = [];
    
    if( this.peek().value !== terminator ){
        do {
            list.unshift( this.literal() );
        } while( this.expect( ',' ) );
    }
    
    return list;
};

/**
 * @function
 * @param {Expression} property The expression assigned to the property of the member expression
 * @param {external:boolean} computed Whether or not the member expression is computed
 * @returns {MemberExpression} The member expression
 */
Builder.prototype.memberExpression = function( property, computed ){
    var // "+ 1" to take the ']' into account, but only for computed member expressions
        end = new Position( this.line, property.loc.end.column + ( computed ? 1 : 0 ) ),
        object = this.expression(),
        start = object.loc.start,
        location = new SourceLocation( start, end );
    
    //console.log( 'MEMBER EXPRESSION' );
    //console.log( '- OBJECT', object );
    //console.log( '- PROPERTY', property );
    //console.log( '- COMPUTED', computed );
    
    return new MemberExpression( object, property, computed, location );
};

/**
 * Provides the next token in the token list _without removing it_. If comparisons are provided, the token will only be returned if the value matches one of the comparisons.
 * @function
 * @param {external:string} [first] The first comparison value
 * @param {external:string} [second] The second comparison value
 * @param {external:string} [third] The third comparison value
 * @param {external:string} [fourth] The fourth comparison value
 * @returns {Lexer~Token} The next token in the list or `undefined` if it did not exist
 */
Builder.prototype.peek = function( first, second, third, fourth ){
    return this.tokens.length ?
        this.peekAt( 0, first, second, third, fourth ) :
        undefined;
};

/**
 * Provides the token at the requested position _without removing it_ from the token list. If comparisons are provided, the token will only be returned if the value matches one of the comparisons.
 * @function
 * @param {external:number} position The position where the token will be peeked
 * @param {external:string} [first] The first comparison value
 * @param {external:string} [second] The second comparison value
 * @param {external:string} [third] The third comparison value
 * @param {external:string} [fourth] The fourth comparison value
 * @returns {Lexer~Token} The token at the requested position or `undefined` if it did not exist
 */
Builder.prototype.peekAt = function( position, first, second, third, fourth ){
    var index, length, token, value;
    
    if( typeof position === 'number' && position > -1 ){
        length = this.tokens.length;
        index = length - position - 1;
        
        if( index > -1 && index < length ){
            token = this.tokens[ index ];
            value = token.value;
            
            if( value === first || value === second || value === third || value === fourth || ( !first && !second && !third && !fourth ) ){
                return token;
            }
        }
    }
    
    return undefined;
};

/**
 * @function
 * @returns {Program} A program node
 */
Builder.prototype.program = function(){
    var body = [];
    
    this.line = 1;
    
    while( true ){
        if( this.tokens.length ){
            body.push( this.expressionStatement() );
        } else {
            return new Program( body );
        }
    }
};

Builder.prototype.sequenceExpression = function( list ){
    var // "- 1" to take the '[' into account
        start = new Position( this.line, this.column - 1 ),
        // "+ 1" to take the ']' into account
        end = new Position( this.line, list[ list.length - 1 ].loc.end.column + 1 ),
        location = new SourceLocation( start, end );
    
    return new SequenceExpression( list, location );
};

/**
 * @function
 * @param {external:string} message The error message
 * @throws {external:SyntaxError} When it executes
 */
Builder.prototype.throwError = function( message ){
    throw new SyntaxError( message );
};

/**
 * @typedef {external:Function} ForEachCallback
 * @param {*} item
 * @param {external:number} index
 */

/**
 * @function
 * @param {Array-Like} list
 * @param {ForEachCallback} callback
 */
function forEach( list, callback ){
    let index = 0,
        length = list.length,
        item;
    
    for( ; index < length; index++ ){
        item = list[ index ];
        callback( item, index );
    }
}

var noop = function(){};

/**
 * @function Interpreter~intepretList
 * @param {Interpreter} interpreter
 * @param {Array-Like} list
 * @param {external:boolean} context
 * @param {external:boolean} create
 * @returns {Array<external:Function>} The interpreted list
 */
function intepretList( interpreter, list, context, create ){
    var result = [];
    forEach( list, function( expression, index ){
        result[ index ] = interpreter.recurse( expression, context, create );
    } );
    return result;
}

/**
 * @class Interpreter
 * @extends Null
 * @param {Builder} builder
 */
function Interpreter( builder ){
    if( !arguments.length ){
        throw new TypeError( 'builder cannot be undefined' );
    }
    
    /**
     * @member {Builder} Interpreter#builder
     */
    this.builder = builder;
}

Interpreter.prototype = new Null();

Interpreter.prototype.constructor = Interpreter;

/**
 * @function
 * @param {external:string} expression
 */
Interpreter.prototype.compile = function( expression, create ){
    var program = this.builder.build( expression ),
        body = program.body,
        interpreter = this,
        expressions, fn;
    
    if( typeof create !== 'boolean' ){
        create = false;
    }
    
    /**
     * @member {external:string}
     */
    interpreter.expression = expression;
    
    //console.log( '-------------------------------------------------' );
    //console.log( 'Interpreting ', expression );
    //console.log( '-------------------------------------------------' );
    
    //console.log( 'Program', program.loc );
    interpreter.eol = program.loc.end.column;
    
    switch( body.length ){
        case 0:
            fn = noop;
            break;
        case 1:
            fn = interpreter.recurse( body[ 0 ].expression, false, create );
            break;
        default:
            expressions = [];
            forEach( body, function( expressionStatement, index ){
                expressions[ index ] = interpreter.recurse( expressionStatement.expression, false, create );
            } );
            fn = function( base, value ){
                var lastValue;
                
                forEach( expressions, function( expression ){
                    lastValue = expression( base, value );
                } );
                
                return lastValue;
            };
            break;
    }
    
    return fn;
};

Interpreter.prototype.recurse = function( node, context, create ){
    var interpreter = this,
        isRightMost = false,
        
        args, fn, left, right;
    
    //console.log( 'NODE', node.type, node.loc.end.column );
        
    switch( node.type ){
        case 'ArrayExpression': {
            args = intepretList( interpreter, node.elements, false );
            
            return function getArrayExpression( base, value ){
                //console.log( 'Getting ARRAY EXPRESSION' );
                var result = [], name;
                forEach( args, function( arg, index ){
                    name = arg( base, value );
                    if( create && !( name in base ) ){
                        base[ name ] = node.order === 1 ?
                            value :
                            {};
                    }
                    result[ index ] = base[ name ];
                } );
                
                if( result.length === 1 ){
                    result = result[ 0 ];
                }
                //console.log( '- ARRAY EXPRESSION RESULT', result );
                return context ?
                    { value: result } :
                    result;
            };
        }
        case 'CallExpression': {
            args = intepretList( interpreter, node.arguments, false );
            right = interpreter.recurse( node.callee, true, create );
            
            return function getCallExpression( base, value ){
                //console.log( 'Getting CALL EXPRESSION' );
                //console.log( '- RIGHT', right.name );
                var values = [],
                    rhs = right( base, value ),
                    result;
                //console.log( '- RHS', rhs );
                if( typeof rhs.value === 'function' ){
                    values = [];
                    
                    forEach( args, function( arg, index ){
                        values[ index ] = arg( base );
                    } );
                    
                    result = rhs.value.apply( rhs.context, values );
                } else if( create && typeof rhs.value === 'undefined' ){
                    throw new Error( 'cannot create call expressions' );
                } else {
                    throw new TypeError( 'call expression must be a function' );
                }
                //console.log( '- CALL RESULT', result );
                return context ?
                    { value: result }:
                    result;
            };
        }
        
        case 'ExpressionStatement': {
            left = interpreter.recurse( node.expression, context, create );
            return function getExpressionStatement( base, value ){
                //console.log( 'Getting EXPRESSION STATEMENT' );
                //console.log( '- EXPRESSION STATEMENT LEFT', left.name );
                var result = left( base, value );
                //console.log( '- EXPRESSION STATEMENT RESULT', result );
                return result;
            };
        }
        
        case 'Identifier': {
            return function getIdentifier( base, value ){
                //console.log( 'Getting IDENTIFIER' );
                var name = node.name,
                    result;
                if( typeof base !== 'undefined' ){
                    if( create && !( name in base ) ){
                        base[ name ] = node.order === 1 ?
                            value :
                            {};
                    }
                    result = base[ name ];
                }
                //console.log( '- NAME', name );
                //console.log( '- IDENTIFIER RESULT', result );
                return context ?
                    { context: base, name: name, value: result } :
                    result;
            };
        }
        case 'Literal': {
            return function getLiteral( base ){
                var result = node.value;
                //console.log( 'Getting LITERAL' );
                //console.log( '- LITERAL RESULT', result );
                return context ?
                    { context: undefined, name: undefined, value: result } :
                    result;
            };
        }
        case 'MemberExpression': {
            left = interpreter.recurse( node.object, false, create );
            isRightMost = node.loc.end.column === interpreter.eol;
            // Computed
            if( node.computed ){
                right = interpreter.recurse( node.property, false, create );
                fn = function getComputedMember( base, value ){
                    //console.log( 'Getting COMPUTED MEMBER' );
                    //console.log( '- COMPUTED LEFT', left.name );
                    //console.log( '- COMPUTED RIGHT', right.name );
                    var lhs = left( base, value ),
                        result, rhs;
                    //console.log( '- COMPUTED LHS', lhs );
                    if( typeof lhs !== 'undefined' ){
                        rhs = right( base, value );
                        //console.log( '- COMPUTED RHS', rhs );
                        if( Array.isArray( lhs ) ){
                            result = [];
                            
                            if( Array.isArray( rhs ) ){
                                forEach( rhs, function( item, index ){
                                    if( create && !( item in lhs ) ){
                                        lhs[ item ] = isRightMost ?
                                            value :
                                            {};
                                    }
                                    result[ index ] = lhs[ item ];
                                } );
                                //console.log( '-- LIST:LIST', result );
                            } else {
                                if( typeof rhs === 'number' ){
                                    if( create && !( rhs in lhs ) ){
                                        lhs[ rhs ] = isRightMost ?
                                            value :
                                            {};
                                    }
                                    result[ 0 ] = lhs[ rhs ];
                                } else {
                                    forEach( lhs, function( item, index ){
                                        if( create && !( rhs in item ) ){
                                            item[ rhs ] = isRightMost ?
                                                value :
                                                {};
                                        }
                                        result[ index ] = item[ rhs ];
                                    } );
                                }
                                //console.log( '-- LIST:VALUE', result );
                            }
                            
                            if( result.length === 1 ){
                                result = result[ 0 ];
                            }
                        } else if( Array.isArray( rhs ) ){
                            result = [];
                            
                            forEach( rhs, function( item, index ){
                                if( create && !( item in lhs ) ){
                                    lhs[ item ] = isRightMost ?
                                        value :
                                        {};
                                }
                                result[ index ] = lhs[ item ];
                            } );
                            //console.log( '-- VALUE:LIST', result );
                            if( result.length === 1 ){
                                result = result[ 0 ];
                            }
                        } else {
                            if( create && !( rhs in lhs ) ){
                                lhs[ rhs ] = isRightMost ?
                                    value :
                                    {};
                            }
                            result = lhs[ rhs ];
                            //console.log( '-- VALUE:VALUE', result );
                        }
                    }
                    //console.log( '- COMPUTED RESULT', result );
                    return context ?
                        { context: lhs, name: rhs, value: result } :
                        result;
                };
            
            // Non-computed
            } else {
                right = node.property.name;
                isRightMost = node.property.loc.end.column === interpreter.eol;
                fn = function getNonComputedMember( base, value ){
                    //console.log( 'Getting NON-COMPUTED MEMBER' );
                    //console.log( '- NON-COMPUTED LEFT', left.name );
                    //console.log( '- NON-COMPUTED RIGHT', right );
                    var lhs = left( base, value ),
                        result;
                    //console.log( '- NON-COMPUTED LHS', lhs );
                    if( typeof lhs !== 'undefined' ){
                        if( Array.isArray( lhs ) ){
                            result = [];
                            forEach( lhs, function( item, index ){
                                if( create && !( right in item ) ){
                                    item[ right ] = isRightMost ?
                                        value :
                                        {};
                                }
                                result[ index ] = item[ right ];
                            } );
                            //console.log( '-- LIST:VALUE', result );
                        } else {
                            if( create && !( right in lhs ) ){
                                lhs[ right ] = isRightMost ?
                                    value :
                                    {};
                            }
                            result = lhs[ right ];
                            //console.log( '-- VALUE:VALUE', result );
                        }
                    }
                    //console.log( '- NON-COMPUTED RESULT', result );
                    return context ?
                        { context: lhs, name: right, value: result } :
                        result;
                };
            }
            
            return fn;
        }
        case 'SequenceExpression': {
            args = intepretList( interpreter, node.expressions, false );
            
            return function getSequenceExpression( base, value ){
                //console.log( 'Getting SEQUENCE EXPRESSION' );
                var result = [];
                forEach( args, function( arg, index ){
                    result[ index ] = arg( base );
                } );
                //console.log( '- SEQUENCE RESULT', result );
                return context ?
                    { value: result } :
                    result;
            };
        }
        default:
            this.throwError( 'Unknown node type ' + node.type );
    }
};

Interpreter.prototype.throwError = function( message ){
    throw new Error( message );
};

var lexer = new Lexer();
var builder = new Builder( lexer );
var intrepreter = new Interpreter( builder );

/**
 * @class KeyPathExp
 * @extends Null
 * @param {external:string} pattern
 * @param {external:string} flags
 */
function KeyPathExp( pattern, flags ){
    typeof pattern !== 'string' && ( pattern = '' );
    typeof flags !== 'string' && ( flags = '' );
    
    Object.defineProperties( this, {
        'flags': {
            value: flags,
            configurable: false,
            enumerable: true,
            writable: false
        },
        'source': {
            value: pattern,
            configurable: false,
            enumerable: true,
            writable: false
        },
        'getter': {
            value: intrepreter.compile( pattern, false ),
            configurable: false,
            enumerable: false,
            writable: false
        },
        'setter': {
            value: intrepreter.compile( pattern, true ),
            configurable: false,
            enumerable: false,
            writable: false
        }
    } );
}

KeyPathExp.prototype = new Null();

KeyPathExp.prototype.constructor = KeyPathExp;

/**
 * @function
 */
KeyPathExp.prototype.get = function( target ){
    return this.getter( target );
};

/**
 * @function
 */
KeyPathExp.prototype.set = function( target, value ){
    return this.setter( target, value );
};

/**
 * @function
 */
KeyPathExp.prototype.toJSON = function(){
    var json = new Null();
    
    json.flags = this.flags;
    json.source = this.source;
    
    return json;
};

/**
 * @function
 */
KeyPathExp.prototype.toString = function(){
    return this.source;
};

var cache = new Null();

/**
 * @typedef {external:Function} KeyPathCallback
 * @param {*} target The object on which the keypath will be executed
 * @param {*} [value] The optional value that will be set at the keypath
 * @returns {*} The value at the end of the keypath or undefined if the value was being set
 */

/**
 * A template literal tag for keypath processing.
 * @function
 * @param {Array<external:string>} literals
 * @param {external:Array} values
 * @returns {KeyPathCallback}
 * @example
 * const object = { foo: { bar: { qux: { baz: 'fuz' } } } },
 *  getBaz = ( target ) => kp`foo.bar.qux.baz`( target );
 * 
 * console.log( getBaz( object ) ); // "fuz"
 */
function kp( literals/*, ...values*/ ){
    var keypath, kpex, values;
    
    if( arguments.length > 1 ){
        var index = 0,
            length = arguments.length - 1;
        
        values = new Array( length );
        
        for( ; index < length; index++ ){
            values[ index ] = arguments[ index + 1 ];
        }
        
        keypath = literals.reduce( function( accumulator, part, index ){
            return accumulator + values[ index - 1 ] + part;
        } );
    } else {
        values = [];
        keypath = literals[ 0 ];
    }
    
    kpex = keypath in cache ?
        cache[ keypath ] :
        cache[ keypath ] = new KeyPathExp( keypath );
    
    return function( target, value ){
        return arguments.length > 1 ?
            kpex.set( target, value ) :
            kpex.get( target );
    };
}

return kp;

})));

//# sourceMappingURL=kp-umd.js.map