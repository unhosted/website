function ContactElement(contact_name,contact_id,contact_email,contact_phone,contact_storage) {
	this.name=contact_name;
	this.id=contact_id;
	this.email=contact_email;
	this.phone=contact_phone;
	this.storagePlace=contact_storage;
	this.getName=function(){
		return this.name;
	};
	this.setId=function(cont_id){
		this.id=cont_id;
	};
	this.getId=function(){
		return this.id;
	};
	this.setEmail=function(cont_email){
		this.email=cont_email;
	};
	this.getEmail=function(){
		return this.email;
	};
	this.setPhone=function(cont_phone){
		this.phone=cont_phone;
	};
	this.getPhone=function(){
		return this.phone;
	};
	this.getStorage=function(){
		return this.storagePlace;
	};
}

function createStorageObject(){
	var contacts=[];
	var i=0;
	for(var n=0;n<remoteStorage.length;n++){
		if(!remoteStorage.getItem(i)){
			n--;
		}else{
			var pseudoVar=remoteStorage.getItem(i);
			var pseudoArray=pseudoVar.split("|&|");
			pseudoVar="";
			contacts[n]=new ContactElement(pseudoArray[0],n,pseudoArray[1],pseudoArray[2],i);
			pseudoArray="";
		}
		i++;
	}
	return contacts;
}

function populateSearchBox(){
	var contacts=[];
	var simpleContactsArray=[];
	contacts=createStorageObject();
	for(var i=0;i<contacts.length;i++){
		simpleContactsArray[i]=[];
		simpleContactsArray[i][0]=contacts[i].getName();
		simpleContactsArray[i][1]=contacts[i].getStorage();
	}
	simpleContactsArray.sort();
	var searchBoxHTML="";
	var selectList = document.getElementById('search_contacts');
	var allOption = document.createElement('option');
	allOption.value = "all";
	allOption.text = "All";
	try {
		selectList.add(allOption, null);
	} catch (ex) {
		selectList.add(allOption);
	}
	for(var n=0;n<simpleContactsArray.length;n++){
		var newOption = document.createElement('option');
		newOption.value = simpleContactsArray[n][1];
		newOption.text = simpleContactsArray[n][0];
		try {
			selectList.add(newOption, null);
		} catch (ex) {
			selectList.add(newOption);
		}
	}
	return true;
}

function displayContactHTML(contactsArrayId){
	var contacts=[];
	contacts=createStorageObject();
	var htmlListItems="";
	if(contacts[contactsArrayId].getEmail()==""){
		htmlListItems+="<li>"+contacts[contactsArrayId].getName()+"<br>--<br>"+contacts[contactsArrayId].getPhone()+"<br><button type=\"button\" onclick=\"editContact('"+contacts[contactsArrayId].getStorage()+"');\">Edit</button> <button type=\"button\" onclick=\"deleteContact('"+contacts[contactsArrayId].getStorage()+"');\">Remove</button></li>";
	}else if(contacts[contactsArrayId].getPhone()==""){
		htmlListItems+="<li>"+contacts[contactsArrayId].getName()+"<br><a href=\"mailto:"+contacts[contactsArrayId].getEmail()+"\" title=\"Send "+contacts[contactsArrayId].getName()+" an email\">"+contacts[contactsArrayId].getEmail()+"</a><br>--<br><button type=\"button\" onclick=\"editContact('"+contacts[contactsArrayId].getStorage()+"');\">Edit</button> <button type=\"button\" onclick=\"deleteContact('"+contacts[contactsArrayId].getStorage()+"');\">Remove</button></li>";
	}else{
		htmlListItems+="<li>"+contacts[contactsArrayId].getName()+"<br><a href=\"mailto:"+contacts[contactsArrayId].getEmail()+"\" title=\"Send "+contacts[contactsArrayId].getName()+" an email\">"+contacts[contactsArrayId].getEmail()+"</a><br>"+contacts[contactsArrayId].getPhone()+"<br><button type=\"button\" onclick=\"editContact('"+contacts[contactsArrayId].getStorage()+"');\">Edit</button> <button type=\"button\" onclick=\"deleteContact('"+contacts[contactsArrayId].getStorage()+"');\">Remove</button></li>";
	}
	return htmlListItems;
}

function displayContacts(){
	var contacts=[];
	contacts=createStorageObject();
	var htmlListItems="";
	for(var n=0;n<remoteStorage.length;n++){
		htmlListItems+=displayContactHTML(n);
	}
	document.getElementById('contacts').innerHTML=htmlListItems;
}

function getDataElements(){
	var idKey=remoteStorage.length;
	while(remoteStorage.getItem(idKey)){
		idKey++;
	}
	document.getElementById('id_field').value=idKey;
	if(remoteStorage.length>0){
		document.getElementById('search_contacts').disabled=false;
		displayContacts();
	}else{
		document.getElementById('search_contacts').disabled=true;
	}
	return true;
}

function showContact(){
	var selected_contact=document.getElementById('search_contacts').value;
	if(selected_contact===""||selected_contact=="all"){
		getDataElements();
	}else{
		var contacts=[];
		contacts=createStorageObject();
		for(var i=0;i<contacts.length;i++){
			if(contacts[i].getStorage()==selected_contact){
				htmlListItems=displayContactHTML(i);
				document.getElementById('contacts').innerHTML="";
				document.getElementById('contacts').innerHTML=htmlListItems;
				break;
			}
		}
	}
	return true;
}

function startAddressBook(){
	populateSearchBox();
	showContact();
	return true;
}

function submitContact(){
	var contact_id=document.getElementById('id_field').value;
	var contact_name=document.getElementById('name_field').value;
	var contact_email=document.getElementById('email_field').value;
	var contact_phone=document.getElementById('phone_field').value;
	if(contact_name===""||(contact_name===""&&contact_email==="")||(contact_name===""&&contact_phone==="")||(contact_email===""&&contact_phone==="")){
		alert('You have to write a name and at least fill the Email or Phone field.');
		stop();
	}else{
		var data=contact_name+"|&|"+contact_email+"|&|"+contact_phone;
		remoteStorage.setItem(contact_id,data);
		return true;
	}
}

function editContact(contact_id){
	contact_id = parseInt(contact_id, 10);
	var contacts=[];
	contacts=createStorageObject();
	for(var i=0;i<contacts.length;i++){
		if(contacts[i].getStorage()==contact_id){
			document.getElementById('id_field').value=contacts[i].getStorage();
			document.getElementById('name_field').value=contacts[i].getName();
			document.getElementById('email_field').value=contacts[i].getEmail();
			document.getElementById('phone_field').value=contacts[i].getPhone();
			break;
		}
	}
	return true;
}

function deleteContact(contact_id){
	var contacts=[];
	contact_id = parseInt(contact_id, 10);
	contacts=createStorageObject();
	for(var i=0;i<contacts.length;i++){
		if(contacts[i].getStorage()===contact_id){
			var confirm_box=confirm("Are you sure you want to permanently remove the entry for "+contacts[i].getName()+"?");
			if(confirm_box===true){
				remoteStorage.removeItem(contacts[i].getStorage());
				window.location.reload();
			}
			break;
		}
	}
	return true;
}

function showContact(){
	var selected_contact=document.getElementById('search_contacts').value;
	if(selected_contact==""||selected_contact=="all"){
		getDataElements();
	}else{
		var contacts=[];
		contacts=createStorageObject();
		for(var i=0;i<contacts.length;i++){
			if(contacts[i].getStorage()==selected_contact){
				htmlListItems=displayContactHTML(i);
				document.getElementById('contacts').innerHTML="";
				document.getElementById('contacts').innerHTML=htmlListItems;
				break;
			}
		}
	}
	return true;
}

function clearAllData(){
	var confirm_box=confirm("Are you sure you want to permanently remove all contacts?");
	if(confirm_box===true){
		remoteStorage.clear();
		window.location.reload();
		return true;
	}else{
		window.location.reload();
		return true;
	}
}