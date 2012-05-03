/* **************************************************************

   Copyright 2011 Zoovy, Inc.

   Licensed under the Apache License, Version 2.0 (the "License");
   you may not use this file except in compliance with the License.
   You may obtain a copy of the License at

     http://www.apache.org/licenses/LICENSE-2.0

   Unless required by applicable law or agreed to in writing, software
   distributed under the License is distributed on an "AS IS" BASIS,
   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   See the License for the specific language governing permissions and
   limitations under the License.

************************************************************** */




var myRIA = function() {
	var r = {
		vars : {
			"templates" : ['profileTemplate','catInfoTemplate','prodlistProdTemplate'],
			"dependAttempts" : 0,  //used to count how many times loading the dependencies has been attempted.
			"dependencies" : ['store_navcats','store_search'] //a list of other extensions (just the namespace) that are required for this one to load
			},
		
		calls: {
			
			appResource : {
				init : function(filename,tagObj,Q)	{
					myControl.util.dump("BEGIN myRIA.calls.appResource.init");
					tagObj = $.isEmptyObject(tagObj) ? {} : tagObj; 
					tagObj.datapointer = 'appResource|'+filename;
					this.dispatch(filename,tagObj,Q);
					return 1;
					},
				dispatch : function(filename,tagObj,Q)	{
					var obj = {};
					obj.filename = filename
					obj["_cmd"] = "appResource";
					obj["_tag"] = tagObj;
					myControl.model.addDispatchToQ(obj,Q);
					}
				},//appResource
//<input hint="mode:elastic-native" id="filter"> { 'or':{ 'filters':[ {'term':{'profile':'DEFAULT'}},{'term':{'profile':'OTHER'}}  ] } };</input>
			getItemsTaggedAs : {
			init : function(qObj,tagObj,Q)	{
				myControl.util.dump("BEGIN myControl.ext.store_search.calls.getItemsTaggedAs");
//				myControl.util.dump(obj);
				this.dispatch(qObj,tagObj,Q)
				return 1;
				},
			dispatch : function(tag,tagObj,Q)	{
				var obj = {};
				obj['_cmd'] = "appPublicSearch";
				obj.type = 'product';
				obj.mode = 'elastic-native';
				obj.size = 250;
				obj['filter'] = { 'and':{ 'filters':[ {'term':{'profile':'E31'}},{'term':{'tags':'IS_SALE'}}  ] } };
				obj['_tag'] = tagObj;
				myControl.model.addDispatchToQ(obj,Q);
				}
				} //getItemsTaggedAs
			}, //calls
		
		callbacks : {
//run when controller loads this extension.  Should contain any validation that needs to be done. return false if validation fails.
			init : {
				onSuccess : function()	{
					var r = true; //return false if extension won't load for some reason (account config, dependencies, etc).
					return r;
					},
				onError : function()	{
//errors will get reported for this callback as part of the extensions loading.  This is here for extra error handling purposes.
//you may or may not need it.
					myControl.util.dump('BEGIN myControl.ext.myRIA.callbacks.init.onError');
					}
				},

//this is the callback defined to run after extension loads.
			startMyProgram : {
				onSuccess : function()	{
					
$('#profileSummary').append(myControl.renderFunctions.createTemplateInstance('profileTemplate',"profileSummaryList"));
					
$('#tabs-1').append(myControl.ext.myRIA.util.objExplore(zGlobals));

					myControl.ext.myRIA.calls.appResource.init('flexedit.json',{'callback':'handleFlexedit','extension':'myRIA'});
					myControl.ext.myRIA.calls.getItemsTaggedAs.init('IS_SALE');
//request profile data (company name, logo, policies, etc)
					myControl.calls.appProfileInfo.init(zGlobals.appSettings.profile,{'callback':'handleProfile','parentID':'profileSummaryList','extension':'myRIA'});
					myControl.ext.store_navcats.calls.appCategoryList.init({"callback":"showRootCategories","extension":"myRIA"});
					myControl.model.dispatchThis();
					
					},
				onError : function(responseData,uuid)	{
//error handling is a case where the response is delivered (unlike success where datapointers are used for recycling purposes)
					myControl.util.handleErrors(responseData,uuid); //a default error handling function that will try to put error message in correct spot or into a globalMessaging element, if set. Failing that, goes to modal.
					}
				}, //startMyProgram

			showRootCategories : {
				onSuccess : function(tagObj)	{
					myControl.ext.store_navcats.util.getChildDataOf('.',{'parentID':'categoryTree','callback':'addCatToDom','templateID':'catInfoTemplate','extension':'store_navcats'},'appCategoryDetailMore');  //generate left nav.
					myControl.model.dispatchThis();
					},
				onError : function(responseData,uuid)	{
	//throw some messaging at the user.  since the categories should have appeared in the left col, that's where we'll add the messaging.
					myControl.util.handleErrors(responseData,uuid);
					}
				}, //showRootCategories
			prodDebug : {
				onSuccess : function(tagObj)	{
					myControl.util.dump("BEGIN myRIA.callbacks.prodDebug");
					$('#attribsDebugData').append(myControl.ext.myRIA.util.objExplore(myControl.data[tagObj.datapointer]['%attribs']));
					$('#variationsDebugData').append(myControl.ext.myRIA.util.objExplore(myControl.data[tagObj.datapointer]['@variations']));
					$('#inventoryDebugData').append(myControl.ext.myRIA.util.objExplore(myControl.data[tagObj.datapointer]['@inventory']));
					
					$('#tabs-5 li:odd').addClass('odd');
					},
				onError : function(responseData,uuid)	{
	//throw some messaging at the user.  since the categories should have appeared in the left col, that's where we'll add the messaging.
					myControl.util.handleErrors(responseData,uuid);
					}
				}, //prodDebug


			handleProfile : {
				onSuccess : function(tagObj)	{
					var dataSrc;
//not all data is at the root level.
					myControl.renderFunctions.translateTemplate(myControl.data[tagObj.datapointer],tagObj.parentID);
					$('#profileData').html(myControl.ext.myRIA.util.objExplore(myControl.data[tagObj.datapointer]));
					},
				onError : function(responseData,uuid)	{
	//throw some messaging at the user.  since the categories should have appeared in the left col, that's where we'll add the messaging.
					myControl.util.dump("BEGIN myRIA.callbacks.handleFlexedit.onError");
					myControl.util.handleErrors(responseData,uuid);
					}
				}, //handleFlexedit


			handleFlexedit : {
				onSuccess : function(tagObj)	{
					// do something
					},
				onError : function(responseData,uuid)	{
	//throw some messaging at the user.  since the categories should have appeared in the left col, that's where we'll add the messaging.
					myControl.util.dump("BEGIN myRIA.callbacks.handleFlexedit.onError");
					myControl.util.handleErrors(responseData,uuid);
					}
				}, //handleFlexedit
				
		handleElasticResults : {
			onSuccess : function(tagObj)	{
				myControl.util.dump("BEGIN myRIA.callbacks.handleElasticResults.onSuccess.");
				var L = myControl.data[tagObj.datapointer]['_count'];
				myControl.util.dump(" -> Number Results: "+L);
				$parent = $('#'+tagObj.parentID).empty().removeClass('loadingBG');
				if(L == 0)	{
					$parent.append("Your query returned zero results.");
					}
				else	{
					var pid;//recycled shortcut to product id.
					for(var i = 0; i < L; i += 1)	{
						pid = myControl.data[tagObj.datapointer].hits.hits[i]['_source']['pid'];
						myControl.ext.store_product.calls.appProductGet.init(pid,{},'passive'); //need full prod data in memory for add to cart to work.
						$parent.append(myControl.renderFunctions.transmogrify({'id':pid,'pid':pid},'prodlistProdTemplate',myControl.data[tagObj.datapointer].hits.hits[i]['_source']));
						}
					myControl.model.dispatchThis('passive');
					}
				},
			onError : function(responseData,uuid)	{
				myControl.util.handleErrors(responseData,uuid)
				}
			},				
				
				
			}, //callbacks

		actions : {
			
			showSubcats : function(path)	{
				myControl.util.dump("BEGIN myRIA.actions.showSubcats ["+path+"]");
				var parentID = 'categoryTreeSubs_'+myControl.util.makeSafeHTMLId(path);
				myControl.util.dump(" -> size() = "+$('#'+parentID+' li').size());
//once the parentID has children, the subcats have already been loaded. don't load them twice.
				if($('#'+parentID+' li').size() == 0)	{ 
					myControl.ext.store_navcats.util.getChildDataOf(path,{'parentID':parentID,'callback':'addCatToDom','templateID':'catInfoTemplate','extension':'store_navcats'},'appCategoryDetailMore');
					myControl.model.dispatchThis();
					}
				}, //showSubcats

			changeDomains : function()	{
				localStorage.clear(); //make sure local storage is empty so a new cart is automatically obtained.
				location.reload(true); //refresh page to restart experience.
				}
			}, //actions
		util : {
			
			handleElasticFilterOrQuery : function()	{
				var type = $('#filterQuerySelection').val();
				var quilter = $.parseJSON($('#filterQuery').val()); //query/filter object
				if(quilter)	{
					myControl.ext.store_search.calls.appPublicProductSearch.init(quilter,{'callback':'handleElasticResults','extension':'myRIA','parentID':'elasticResults','datapointer':'elasticsearch|'+type});
					myControl.model.dispatchThis();
					}
				else	{
					alert('invalid json');
					}
				
				},
			
			objExplore : function(obj)	{
// 				myControl.util.dump("BEGIN myRIA.util.objExplore");
				var keys = new Array();
				for (var n in obj) {
					keys.push(n);
					}
				keys.sort();
				var L = keys.length;
				var $ul = $('<ul \/>');
				var $prompt,$value,$li;
				var r = '<ul>'; //what is returned. an html string of key/value pairs for obj passed in.
				for(var i = 0; i < L; i += 1)	{
					$li = $('<li>');
					$prompt = $('<span>').addClass('prompt').text(keys[i]).appendTo($li);
					
					if(typeof obj[keys[i]] == 'object')	{
						$value = myControl.ext.myRIA.util.objExplore(obj[keys[i]]);
						}
					else	{
						$value = $('<span>').addClass('value').text(obj[keys[i]]);
						}
					$value.appendTo($li);
					$li.appendTo($ul);
					}

				return $ul;
				}
			
			} //util

		} //r object.
	return r;
	}