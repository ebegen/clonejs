// nodeunit

if(typeof $object==='undefined'){
    var clonejs = require('../src/clone.js'),
        $object = clonejs.prototype;
}

this.tests = {

    clone: {
        '': function(test){
            var clone = $object.clone({a:1});
                test.ok( clone.hasOwnProperty('a') );
                test.equal( Object.getPrototypeOf(clone), $object);
                test.strictEqual( Object.getOwnPropertyNames(clone).length, 1);
    
            clone = $object.clone({a:1}, {});
                test.ok( clone.hasOwnProperty('a') );
                test.equal( Object.getPrototypeOf(clone), $object);
                test.strictEqual( Object.getOwnPropertyNames(clone).length, 1);
    
            clone = $object.clone();
                test.strictEqual( Object.getOwnPropertyNames(clone).length, 0);
                test.equal( Object.getPrototypeOf(clone), $object);
    
            test.done();
        },
    
        call: function(test){
            var $proto = {a: 1};
    
                var clone = $object.clone.call($proto);
                    test.equal( Object.getPrototypeOf(clone), $proto,
                        'check prototype');
    
                clone = $object.clone.call($proto, {b:2});
                    test.ok( clone.hasOwnProperty('b') );
    
                clone = $object.clone.call($proto, {b:2}, {});
                    test.ok( clone.hasOwnProperty('b') );
    
            test.done();
        },
    
        constructor: function(test){
            var constructor = $object.clone({constructor: ''}).constructor;
            var c = $object.clone({constructor: ''});
                test.ok(constructor !== c.constructor);
                test.ok(constructor !== $object.clone().constructor);
                test.equal(typeof constructor, 'function');
    
    
            test.done();
        }
    },

    create: {
        
        '': function(test){
            var customConstructorCalled = false;
            var $myType = $object.clone({
                constructor: function(){
                    customConstructorCalled = true;
                }
            });
            var instance = $myType.create({ignored: true});
                test.ok(customConstructorCalled);
                test.ok(typeof instance.ignored == 'undefined');
    
    //        instance = $object.create();
    //            test.ok( Object.isSealed(instance), 'the created object should be sealed by default');
    
            test.done();
        },
        
        'super property should can be modified': function(test){
            
            var obj = $object.clone({a: 1}).create();
            obj.a = 2;
                
                test.equal(obj.a, 2);
            
            test.done();
        }
    },

    describe: function(test){
        
        function Constructor(){}

        test.deepEqual(
            $object.describe({
                          _p: undefined,
       '(const) _unwritable': 231,
                   property1: 11,
        '(hidden) property2': 22,
      '(writable) property3': 33,
         '(final) property4': 44,
'(final writable) property5': 55,
                      method: Function,
                 constructor: Constructor
            }),{
                         _p: {value: undefined, enumerable:false},
                _unwritable: {value: 231, enumerable:false, writable: false},
                  property1: {value: 11},
                  property2: {value: 22, enumerable:false},
                  property3: {value: 33, writable:true},
                  property4: {value: 44, writable:false, configurable: false},
                  property5: {value: 55, writable:true, configurable: false},
                     method: {value: Function, enumerable:false},
                constructor: {value: Constructor, enumerable:false}
            }
        );
        
        /// Constructor:
        
        var proto = {};
        var descriptors = $object.describe.call(proto, {constructor: 'MyCustomName'});

            var constructor = descriptors.constructor.value;
            test.equal(typeof constructor, 'function');
            test.equal(constructor.name, 'MyCustomName');
            test.equal(constructor.typeName, 'MyCustomName');
            test.strictEqual(constructor.prototype, proto);

        var $obj = $object.clone().clone();
        constructor.call($obj, {key: 11});
            
            test.equal($obj.key, 11);
        
        /// TODO: test defaultDescriptor 

        test.done();
    },

    'can, cant': function(test){

        var $myObj = $object.clone({
            fly: function(){},
            swim: function(a,b,c){}
        });
        var myObj = $myObj.create();
            test.ok(!!   myObj.can('swim').as($myObj) );
            test.ok(!! $object.can.call(myObj, 'fly').like($myObj) );

            test.ok(!    myObj.cant('swim').as($myObj) );
            test.ok(!  $object.cant.call(myObj, 'fly').like($myObj) );

        test.done();
    },

    copy: function(test){
        var myArray = $object.copy(Array);
        myArray[0] = 11;
        myArray[1] = 22;
            test.deepEqual(myArray, [11 ,22]);

            myArray.defineProperties({test: 'T'});
                test.strictEqual(myArray.test, 'T');


        var $collection = $object.clone({items: []});
        var $users = $collection.clone({name: ''});

            // $users full prototype chain:
            //$users -> $collection -> $object -> Object.prototype -> null

            // see prototype chains produced by copy:

            var userCopy = $users.copy();
            //~$users -> $object
                test.equal(Object.getPrototypeOf(userCopy), $object);
                test.ok(userCopy.hasOwnProperty('name'));
                test.ok(userCopy.items === undefined);

            userCopy = $users.copy(Array);
            //~$users -> Array.prototype
                test.equal(Object.getPrototypeOf(userCopy), Array.prototype);
                test.ok(userCopy.hasOwnProperty('name'));
                test.ok(userCopy.items === undefined);
                test.ok(userCopy.clone === undefined);

            userCopy = $users.copy(Array, Infinity);
            //~$users -> ~$collection -> ~$object -> Array.prototype
                test.ok(userCopy.hasOwnProperty('name'));
                test.ok(userCopy.getPrototype().hasOwnProperty('items'));
                test.ok(userCopy.getPrototype().getPrototype().hasOwnProperty('clone'));
                test.ok(userCopy.getPrototype().getPrototype().getPrototype() === Array.prototype);

            userCopy = $users.copy(Array, Infinity, true);
            //~($users + $collection + $object) -> Array.prototype
                test.equal(Object.getPrototypeOf(userCopy), Array.prototype);
                test.ok(userCopy.hasOwnProperty('name'));
                test.ok(userCopy.hasOwnProperty('items'));
                test.ok(userCopy.hasOwnProperty('clone'));

        //TODO: add tests for deepCopy/deepClone

        test.done();
    },

    deepCopy: function(test){
        var obj = $object.clone({l1: {l2: {l3: null}}});
        var deepCopy = obj.deepCopy();
        test.strictEqual(deepCopy.l1.l2.l3, null);

            obj.l1.l2.l3 = 11;
                test.strictEqual(deepCopy.l1.l2.l3, null);

            deepCopy.l1.l2.l3 = 22;
                test.strictEqual(obj.l1.l2.l3, 11);

        test.done();
    },

    deepClone: function(test){
        var obj = $object.clone({l1: {l2: {l3: null}}});
        var deepClone = obj.deepClone();
            test.strictEqual(deepClone.l1.l2.l3, null);

            obj.l1.l2.l3 = 11;
                test.strictEqual(deepClone.l1.l2.l3, 11);

            deepClone.l1.l2.l3 = 22;
                test.strictEqual(obj.l1.l2.l3, 11);

        test.done();
    },

    '__super__': {
        'callSuper, applySuper': function(test){
            var calls = [];
            var $parent = $object.clone({
                constructor: function(arg){
                    calls.push('collection');
                    this.callSuper('constructor', arg);
                }
            });
            var $child = $parent.clone({
                constructor: function(arg){
                    calls.push('users');
                    this.applySuper(arguments);
                }
            });
            var child = $child.create({setBy$objectConstructor: 11});
                
                test.deepEqual(calls, ['users','collection']);
                test.equal(child.setBy$objectConstructor, 11);
    
            test.done();
        },
        
        'createSuperSafeCallback, __super__': function(test){
    
            test.expect(3);
    
            var $parent = $object.clone({
                testSuper: function(){
                    test.strictEqual(this.__super__, $object);
                }
            });
            var $child = $parent.clone({
                constructor: function(){
                    this.applySuper();
                    test.strictEqual(this.__super__, $parent);
                },
                
                asyncCheck: function(){
                    var callback = this.createSuperSafeCallback(function(){
                        test.strictEqual(this.__super__, $parent);
                        this.applySuper('testSuper');                    
                    },this);
                    
                    setTimeout(callback, 0);
                }
            });
    
            var child = $child.create();
            child.asyncCheck();
    
            setTimeout(function(){
                test.done();
            },0);
        },
        
        "first call applySuper() on sealed object \
         should doesn't throw an error": function(test){
            
            var $parent = $object.clone({
                method: function(){}
            });
            var $child = $parent.clone({
                method: function(arg){
                    this.applySuper('method');
                }
            });
            var child = $child.clone();
            child.seal();
                
                test.doesNotThrow(function(){
                    child.method();    
                });

            test.done();
        }
    },

    apply: function(test){
        //methodName, args, withObj, asObj
        var asObj = {defineProperties: function(){
            this.called = true;
            return this;
        }};
        var obj = $object.apply(Array(22,33), 'defineProperties',[{a:11}], asObj);
            test.equal(obj.a, undefined);
            test.ok(obj.called);
            test.equal(obj[0], 22);
            test.equal(Object.getPrototypeOf(obj), Array.prototype);

        //methodName, args, withObj
        obj = $object.apply(Array(22,33), 'defineProperties',[{a:11}]);
            test.equal(obj.a,  11);
            test.equal(obj[0], 22);
            test.equal(Object.getPrototypeOf(obj), Array.prototype);

        //methodName, withObj
        obj = $object.apply(Array(22,33), 'defineProperties');
            test.equal(obj[0], 22);
            test.equal(Object.getPrototypeOf(obj), Array.prototype);

        test.done();
    },

    concat: function(test){
        var $parent = $object.clone({a: 1});
        var $child  = $parent.clone({b: 2});
        var toMerge = $child .clone({c: 3, _c: 33});

            var obj = $object.clone().concat(toMerge);
                test.strictEqual(obj._c, 33);
                test.strictEqual(obj.c,  3);
                test.strictEqual(obj.b,  undefined);
                test.strictEqual(obj.a,  undefined);

            obj = $object.clone().concat(toMerge, ['a','_c']);
                test.strictEqual(obj._c, 33);
                test.strictEqual(obj.c,  undefined);
                test.strictEqual(obj.b,  undefined);
                test.strictEqual(obj.a,  1);

            obj = $object.clone().concat(toMerge, true);
                test.strictEqual(obj._c, 33);
                test.strictEqual(obj.c,  3);
                test.strictEqual(obj.b,  2);
                test.strictEqual(obj.a,  1);

        test.done();
    },

    getPrototypes: function(test){
        var ns = clonejs.$namespace.clone();
            ns.extend('level1',{n:1})
              .extend('level1_1',{n:2})
              .extend('level1_1_1',{n:3});
        
        var $obj = ns.level1.level1_1.$level1_1_1.create();
        
            test.deepEqual($obj.getPrototypes(), [{n:1}, {n:2}, {n:3}]);
            test.deepEqual($obj.getPrototypes(undefined, true), [{n:3}, {n:2}, {n:1}]);
            test.deepEqual($obj.getPrototypes(Object.prototype), [Object.prototype, {n:1}, {n:2}, {n:3}]);
            //test.deepEqual($obj.getPrototypes(null), [Object.prototype, Object.prototype, {n:1}, {n:2}, {n:3}]);
        
        test.done();
    },

    getValues: function(test){
        var obj = $object.clone({en:'1 0', _p:'0 0'}).clone({ownEn:'1 1', _own:'0 1'});
        //                      enumerable,   own
        test.deepEqual(obj.getValues(true,   true).sort(), [ '1 1' ]); 
        test.deepEqual(obj.getValues(false, false).sort(), [ '0 0', '0 1', '1 0', '1 1' ]);
        test.deepEqual(obj.getValues(false,  true).sort(), [ '0 1', '1 1' ]);
        test.deepEqual(obj.getValues(true,  false).sort(), [ '1 0', '1 1' ]); 
        
        test.done();
    },

    setValues: function(test){
        var obj = $object.clone({en:'1 0', _p:'0 0'}).clone({ownEn:'1 1', _own:'0 1'}), values;

        values = obj.getValues();
            test.deepEqual(obj, obj.copy(Infinity).setValues(values) );
       
        values = obj.getValues(true);
            test.deepEqual(obj, obj.copy(Infinity).setValues(values, true) );

        values = obj.getValues(false);
            test.deepEqual(obj, obj.copy(Infinity).setValues(values, false) );
        
//        values = obj.getValues(true, false);
//            test.deepEqual(obj, obj.copy(Infinity).setValues(values, true,  false) );
        
        values = obj.getValues(false, true);
            test.deepEqual(obj, obj.copy(Infinity).setValues(values, false, true) );
        
//        values = obj.getValues(false, false);
//            test.deepEqual(obj, obj.copy(Infinity).setValues(values, false, false) );
        
        
        test.done();
    },

    $namespace: {
        /*
        
        namespace contents:
            ns = {
                prototype: $ns,
                items: {
                    prototype: $item,
                    subitems: {}, 
                    $subitem: $subitem,
                    
                    extend: $ns.extend
                },
                $item: $item,
    
                extend: $ns.extend,
                put: $ns.put
            }
            
        1) $subitem should be a direct child of $item
        2) items, subitems should be plural
    
        clone.clone()
        clone.prototype
        */
        
        extend: function(test){
            var ns1 = clonejs.$namespace.create();
            ns1.extend('collection',          {name: 'collection'})
                   .extend('arrayCollection', {name: 'arrayCollection'});
    
                _ns_check(ns1, test);
            
            test.done();
        },
        
        put: function(test){
            var $collection = $object.clone({constructor: 'Collection'}),
                $arrayCollection = $collection.clone({constructor: 'ArrayCollection'});
            var ns2 = clonejs.$namespace.create();
            ns2.put($arrayCollection);
        
                _ns_check(ns2, test);
    
            var ns3 = clonejs.$namespace.create();
            ns3.put('collection.arrayCollection', $arrayCollection);
            
                _ns_check(ns3, test);
            
            test.done();
        }
    }
};

function _ns_check(newNS, test){
    test.strictEqual(newNS.prototype, $object);
    test.strictEqual(newNS.extend,    clonejs.$namespace.extend);
    test.strictEqual(newNS.put,       clonejs.$namespace.put);
    
    test.ok( $object.isPrototypeOf(newNS.$collection) );
    test.equal( newNS.$collection.constructor.typeName, 'Collection');
    test.strictEqual(newNS.collection.prototype, newNS.$collection);
    test.strictEqual(newNS.collection.extend,    clonejs.$namespace.extend);

    test.ok( newNS.$collection.isPrototypeOf(newNS.collection.$arrayCollection) );
    test.equal( newNS.collection.$arrayCollection.constructor.typeName, 'ArrayCollection');
    test.strictEqual(newNS.collection.arrayCollection.prototype, newNS.collection.$arrayCollection);
    test.strictEqual(newNS.collection.arrayCollection.extend,    clonejs.$namespace.extend);
}
