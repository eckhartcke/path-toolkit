// Parsing, tokeninzing, etc
'use strict';

var prefixes = {
    '<': {
        'exec': 'parent'
    },
    '~': {
        'exec': 'root'
    },
    '%': {
        'exec': 'placeholder'
    }
},
prefixList = Object.keys(prefixes);

var separators = {
    '.': {
        'exec': 'property'
        },
    ',': {
        'exec': 'collection'
        }
},
separatorList = Object.keys(separators);

var containers = {
    // '[': {
    //     'closer': ']',
    //     'exec': '??'
    //     },
    '(': {
        'closer': ')',
        'exec': 'call'
        },
    '{': {
        'closer': '}',
        'exec': 'property'
        }
},
containerList = Object.keys(containers);

var wildCardMatch = function(template, str){
    var pos = template.indexOf('*'),
        parts = template.split('*', 2),
        match = true;
    if (parts[0]){
        match = match && str.substr(0, parts[0].length) === parts[0];
    }
    if (parts[1]){
        match = match && str.substr(pos+1) === parts[1];
    }
    return match;
};
var specials = '[\\' + ['*'].concat(prefixList).concat(separatorList).concat(containerList).join('\\').replace(/\\?\./, '') + ']';
var specialRegEx = new RegExp(specials);
console.log('Specials:', specialRegEx.toString());
console.log(specialRegEx.test('abc()'));

var isObject = function(val) {
    if (val === null) { return false;}
    return ( (typeof val === 'function') || (typeof val === 'object') );
};

var flatten = function(ary){
    ary = Array.isArray(ary) ? ary : [ary];
    return ary.reduce(function(a, b) {
      return a.concat(b);
    },[]);
};

var cache = {};

/*
 *  Scan input string from left to right, one character at a time. If a special character
 *  is found (one of "separators" or "containers"), either store the accumulated word as
 *  a token or else begin watching input for end of token (finding a closing character for
 *  a container or the end of a collection). If a container is found, call tokenize
 *  recursively on string within container.
 */
var tokenize = function (str){
    if (cache[str]){ return cache[str]; }

    var tokens = [],
        mods = {},
        strLength = str.length,
        word = '',
        substr = '',
        i,
        opener, closer, separator,
        collection = [],
        depth = 0;

    // console.log('Parsing:', str);

    for (i = 0; i < strLength; i++){
        if (depth > 0){
            // Scan for closer
            str[i] === opener && depth++;
            str[i] === closer.closer && depth--;

            if (depth > 0){
                substr += str[i];
            }
            // TODO: handle comma-separated elements when depth === 1, process as function arguments
            else {
                if (i+1 < strLength && separators[str[i+1]] && separators[str[i+1]].exec === 'collection'){
                    collection.push({'t':tokenize(substr), 'exec': closer.exec});
                }
                else if (collection[0]){
                    collection.push({'t':tokenize(substr), 'exec': closer.exec});
                    tokens.push(collection);
                    collection = [];
                }
                else {
                    tokens.push({'t':tokenize(substr), 'exec': closer.exec});
                }
                substr = '';
            }
        }
        else if (str[i] in prefixes){
            mods.has = true;
            if (mods[prefixes[str[i]].exec]) { mods[prefixes[str[i]].exec]++; }
            else { mods[prefixes[str[i]].exec] = 1; }
        }
        else if (str[i] in separators){
            separator = separators[str[i]];
            if (word && mods.has){
                word = {'w': word, 'mods': mods};
                mods = {};
            }
            if (separator.exec === 'property'){
                // word is a plain property or end of collection
                if (collection[0] !== undefined){
                    // we are gathering a collection, so add last word to collection and then store
                    word && collection.push(word);
                    tokens.push(collection);
                    collection = [];
                }
                else {
                    // word is a plain property
                    word && tokens.push(word);
                }
            }
            else if (separator.exec === 'collection'){
                // word is a collection
                word && collection.push(word);
            }
            word = '';
        }
        else if (closer = containers[str[i]]){
            // found opener, initiate scan for closer
            if (word && mods.has){
                word = {'w': word, 'mods': mods};
                mods = {};
            }
            if (collection[0] !== undefined){
                // we are gathering a collection, so add last word to collection and then store
                word && collection.push(word);
            }
            else {
                // word is a plain property
                word && tokens.push(word);
            }
            word = '';
            opener = str[i];
            depth++;
        }
        else {
            // still accumulating property name
            word += str[i];
        }
    }
    // add trailing word to tokens, if present
    if (word && mods.has){
        word = {'w': word, 'mods': mods};
        mods = {};
    }
    if (collection[0] !== undefined){
        // we are gathering a collection, so add last word to collection and then store
        word && collection.push(word);
        tokens.push(collection);
    }
    else {
        // word is a plain property
        word && tokens.push(word);
    }

    // depth != 0 means mismatched containers
    if (depth !== 0){ return undefined; }

    cache[str] = tokens;
    return tokens;
};

// var getContext = function getContext(context, valueStack, word){
// 	if (!prefixes[word[0]]){
// 		return context;
// 	}
// 	var counter = 0,
// 		prefix,
// 		newContext;
// 	while (prefix = prefixes[word[counter]]){
// 		if (prefix.exec === 'parent'){
// 			newContext = valueStack[counter + 1];
// 		}
// 		counter++;
// 	}
// 	return newContext;
// };

// var cleanWord = function cleanWord(word){
// 	if(!prefixes[word[0]]){
// 		return word;
// 	}
// 	var len = word.length;
// 	for (var i = 1; i < len; i++){
// 		if (!prefixes[word[i]]){
// 			return word.substr(i);
// 		}
// 	}
// 	return '';
// }

var resolvePath = function (obj, path, newValue, args, valueStack){
    if (typeof path === 'string' && typeof newValue === 'undefined' && !path.match(specialRegEx)){
        var ary = path.split('.');
        var len = ary.length;
        var returnVal = obj;
        var i = 0;
        while (returnVal !== undefined && i < len){
            if (i.length < 0){ returnVal = undefined; }
            returnVal = returnVal[ary[i]];
            i++;
        }
        return returnVal;
    }

    valueStack = valueStack || [obj]; // Initialize valueStack with original data object
    args = args || []; // args defaults to empty array

    var change = newValue !== undefined,
        val,
        tk,
        i,
        root = valueStack[valueStack.length -1]; // Root is an alias for original data object

    tk = typeof path === 'string' ? tokenize(path) : path.t ? path.t : [path];

    return tk.length === 0 ? undefined : tk.reduce(function(prev, curr, idx){
        var context = valueStack[0],
            ret,
            lastToken = (idx === (tk.length - 1)),
            newValueHere = (change && lastToken);
        if (typeof curr === 'string'){
            // Cannot do ".hasOwnProperty" here since that breaks when testing
            // for functions defined on prototypes (e.g. [1,2,3].sort())
            if (typeof context[curr] !== 'undefined') {
                if (newValueHere){ context[curr] = newValue; }
                ret = context[curr];
            }
            else if (curr.indexOf('*') >-1){
                ret = [];
                for (var prop in context){
                    if (context.hasOwnProperty(prop) && wildCardMatch(curr, prop)){
                        if (newValueHere){ context[prop] = newValue; }
                        ret.push(context[prop]);
                    }
                }
            }
            else { return undefined; }
        }
        else if (Array.isArray(curr)){
            // call resolvePath again with base value as evaluated value so far and
            // each element of array as the path. Concat all the results together.
            ret = [];
            for (i = 0; curr[i] !== undefined; i++){
                if (newValueHere){
                    if (curr[i].t && curr[i].exec === 'property'){
                        context[resolvePath(context, curr[i], newValue, args, valueStack.concat())] = newValue;
                        ret = ret.concat(context[resolvePath(context, curr[i], newValue, args, valueStack.concat())]);
                    } else {
                        ret = ret.concat(resolvePath(context, curr[i], newValue, args, valueStack.concat()));
                    }
                }
                else {
                    if (curr[i].t && curr[i].exec === 'property'){
                        ret = ret.concat(context[resolvePath(context, curr[i], newValue, args, valueStack.concat())]);
                    } else {
                        ret = ret.concat(resolvePath(context, curr[i], newValue, args, valueStack.concat()));
                    }
                }
            }
        }
        else if (typeof curr === 'undefined' || typeof prev === 'undefined'){
            ret = undefined;
        }
        else if (curr.w){
            // this word token has modifiers, modify current context
            if (curr.mods.parent){
                context = valueStack[curr.mods.parent];
                if (typeof context === 'undefined') { return undefined; }
            }
            if (curr.mods.root){
                // Reset context and valueStack, start over at root in this context
                context = root;
                valueStack = [root];
            }
            if (curr.mods.placeholder){
                if (curr.w.length === 0) { return undefined; }
                var placeInt = Number.parseInt(curr.w) - 1;
                if (typeof args[placeInt] === 'undefined'){ return undefined; }
                // Force args[placeInt] to String, won't attempt to process
                // arg of type function, array, or plain object
                curr.w = args[placeInt].toString();
                delete(curr.mods.placeholder); // Once value has been replaced, don't want to re-process this entry
                delete(curr.mods.has);
            }

            // Repeat basic string property processing with word and modified context
            if (context.hasOwnProperty(curr.w)) {
                if (newValueHere){ context[curr.w] = newValue; }
                ret = context[curr.w];
            }
            else if (typeof context === 'function'){
                ret = curr.w;
            }
            else if (curr.w.indexOf('*') >-1){
                ret = [];
                for (var prop in context){
                    if (context.hasOwnProperty(prop) && wildCardMatch(curr.w, prop)){
                        if (newValueHere){ context[prop] = newValue; }
                        ret.push(context[prop]);
                    }
                }
            }
            else { return undefined; }
        }
        else if (curr.exec === 'property'){
            if (newValueHere){
                context[resolvePath(context, curr, newValue, args, valueStack.concat())] = newValue;
            }
            ret = context[resolvePath(context, curr, newValue, args, valueStack.concat())];
        }
        else if (curr.exec === 'call'){
            // TODO: handle params for function
            var callArgs = resolvePath(context, curr, newValue, args, valueStack.concat());
            if (callArgs === undefined){
                ret = context.apply(valueStack[1]);
            }
            else if (Array.isArray(callArgs)){
                ret = context.apply(valueStack[1], callArgs);
            }
            else {
                ret = context.call(valueStack[1], callArgs);
            }
        }
        valueStack.unshift(ret);
        return ret;
    }, obj);
};

var scanForValue = function(obj, val, savePath, path){
    var i, len, prop, more;

    path = path ? path : '';

    if (obj === val){
        return savePath(path); // true -> keep looking; false -> stop now
    }
    else if (Array.isArray(obj)){
        len = obj.length;
        for(i = 0; i < len; i++){
            more = scanForValue(obj[i], val, savePath, path + '.' + i);
            if (!more){ return; }
        }
        return true; // keep looking
    }
    else if (isObject(obj)) {
        for (prop in obj){
            if (obj.hasOwnProperty(prop)){
                more = scanForValue(obj[prop], val, savePath, path + '.' + prop);
                if (!more){ return; }
            }
        }
        return true; // keep looking
    }
    // Leaf node (string, number, character, boolean, etc.), but didn't match
    return true; // keep looking
};

export var getTokens = function(path){
    return {t: tokenize(path)};
};

export var getPath = function (obj, path){
    var args = arguments.length > 2 ? Array.prototype.slice.call(arguments, 2) : [];
    return resolvePath(obj, path, undefined, args);
};

export var setPath = function(obj, path, val){
    var args = arguments.length > 3 ? Array.prototype.slice.call(arguments, 3) : [],
        ref = resolvePath(obj, path, val, args);
    if (Array.isArray(ref)){
        return ref.indexOf(undefined) === -1;
    }
    return typeof ref !== 'undefined';
};

export var getPathFor = function(obj, val, oneOrMany){
    var retVal = [];
    var savePath = function(path){
        retVal.push(path.substr(1));
        if(!oneOrMany || oneOrMany === 'one'){
            retVal = retVal[0];
            return false;
        }
        return true;
    };
    scanForValue(obj, val, savePath);
    return retVal[0] ? retVal : undefined;
};

// export var setOptions = function(options){
//     if (options.prefixes){
//         for (var p in options.prefixes){
//             if (options.prefixes.hasOwnProperty(p)){
//                 prefixes[p] = options.prefixes[p];
//             }
//         }
//     }
//     if (options.separators){
//         for (var s in options.separators){
//             if (options.separators.hasOwnProperty(s)){
//                 separators[s] = options.separators[s];
//             }
//         }
//     }
//     if (options.containers){
//         for (var c in options.containers){
//             if (options.containers.hasOwnProperty(c)){
//                 containers[c] = options.containers[c];
//             }
//         }
//     }
// };
