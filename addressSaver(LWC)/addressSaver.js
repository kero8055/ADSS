import { LightningElement, track, api } from 'lwc';
import getCountries from '@salesforce/apex/AddressData.fetchCountries';
import getStates from '@salesforce/apex/AddressData.fetchStates';
import getCities from '@salesforce/apex/AddressData.fetchCities';
import { createRecord } from 'lightning/uiRecordApi';
import Customer_Address from '@salesforce/schema/Customer_Address__c';
import Contact_FIELD from '@salesforce/schema/Customer_Address__c.Contact__c';
import Country_FIELD from '@salesforce/schema/Customer_Address__c.Country__c';
import State_FIELD from '@salesforce/schema/Customer_Address__c.State__c';
import City_FIELD from '@salesforce/schema/Customer_Address__c.City__c';
import BuildingName_FIELD from '@salesforce/schema/Customer_Address__c.Building_Name__c';
import Latitude_FIELD from '@salesforce/schema/Customer_Address__c.Location__Latitude__s';
import Longitude_FIELD from '@salesforce/schema/Customer_Address__c.Location__Longitude__s';

export default class AddressSaver extends LightningElement {
@track StateList;
@track CityList;
@track CountryList;
@api recordId;
StateValue;
CityValue;
CountryValue;
buildingValue='';
geocodeData;
message='';
latitude='';
longitude='';
finalId;
    connectedCallback(){
        getCountries({})
        .then(result => {
            this.CountryList= result;
        })
        .catch(error => {
                
        })
    }
    handlebuildingNameChange(event){
        this.buildingValue=event.detail.value;
    }
    handleCountryChange(event){
        this.CountryValue=event.detail.value;
        //for refreshing dependent picklist
        this.StateList=[];
        this.CityList=[];
        this.StateValue='';
        this.CityValue='';
        getStates({'CountryName':event.detail.value})
        .then(result => {
            this.StateList =result;
        
        })
        .catch(error => {
            
        })
    }
    handleStateChange(event){
        this.StateValue = event.detail.value;
        getCities({'CountryName':this.CountryValue,'StateName':this.StateValue})
        .then(result => {
            this.CityList=result;
        
        })
        .catch(error => {
            
        })
    }
    handleCityChange(event){
        this.CityValue = event.detail.value;
    }
    //common method to check for empty string
    checkforemptyString(value){
        if(value!='' && value!=undefined && value!=null){
            return true;
        }
        else{
            return false;
        }
    }
    saveaddress(){
        this.message='';
        var address='';
        this.latitude=undefined;
        this.longitude=undefined;
        // for handling null pointer exceptions
        if(this.checkforemptyString(this.buildingValue)){
            address=this.buildingValue+',';
        }
        if(this.checkforemptyString(this.CityValue)){
            address=address+this.CityList.find(option => option.value === this.CityValue).label+',';
        }
        if(this.checkforemptyString(this.StateValue)){
            address=address+this.StateList.find(option => option.value === this.StateValue).label+',';
        }
        if(this.checkforemptyString(this.CountryValue)){
            address=address+this.CountryList.find(option => option.value === this.CountryValue).label;
        }
        //fetch Latitude and Longitude from 3rd party API from JS 
        const endpoint = 'https://geocode.maps.co/search?q='+address+'&api_key=6659d4441eb12156205706plf9542be';
        fetch(endpoint,{
            method: 'GET'    
        })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok ' + response.statusText);
                }
                return response.json();
            })
            .then(data => {
                this.geocodeData = data;
                console.log('Geocode Data:', this.geocodeData.length);
                if(data.length==0){
                    this.message='Location not Found.';
                }
                else{
                    this.latitude=this.geocodeData[0].lat;
                    this.longitude=this.geocodeData[0].lon;
                    this.message='Latitude: '+this.geocodeData[0].lat+' Longitute: '+this.geocodeData[0].lon;
                    //Method called to create customer address record
                    this.createRecord();
                }
                this.error = undefined;
               
            })
            .catch(error => {
                this.error = error;
                this.geocodeData = undefined;
                console.error('Error fetching geocode data:', this.error);
            });
    }
    //Method to create record in Salesforce, without using Apex class and using Lightning Data Services
    createRecord() {
        console.log(Latitude_FIELD.fieldApiName);
        console.log(Longitude_FIELD.fieldApiName);
        const fields = {};
        fields[Contact_FIELD.fieldApiName] = this.recordId;
        fields[Country_FIELD.fieldApiName] = this.checkforemptyString(this.CountryValue)?this.CountryValue:null;
        fields[State_FIELD.fieldApiName] = this.checkforemptyString(this.StateValue)?this.StateValue:null;
        fields[City_FIELD.fieldApiName] =   this.checkforemptyString(this.CityValue)?this.CityValue:null;
        fields[BuildingName_FIELD.fieldApiName] = this.checkforemptyString(this.buildingValue)?this.buildingValue:'';
        fields['Location__Latitude__s'] =  parseFloat(this.latitude);
        fields['Location__Longitude__s'] = parseFloat(this.longitude);

        const recordInput = { apiName: Customer_Address.objectApiName, fields };

        createRecord(recordInput)
            .then(result => {
                this.finalId = result.id;
                console.log('Record created with ID: ' + result.id);
            })
            .catch(error => {
                this.finalId = undefined;
                console.error('Error creating record: ' + error.body.message);
            });
    }
}