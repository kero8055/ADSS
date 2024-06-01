public class AddressData {
       @AuraEnabled(cacheable=true)
    public static List<PicklistWrapper> fetchCountries(){
        List<PicklistWrapper> piklistList = new  List<PicklistWrapper>();
        try {

            for(Country__c con: [select id,Name from Country__c]){
                PicklistWrapper wrap = new PicklistWrapper();
                wrap.label=con.Name;
                wrap.value=con.Id;
                piklistList.add(wrap);
                
            }
            
        } catch (Exception e) {
            throw new AuraHandledException(e.getMessage());
        }
        return piklistList;
    }
    @AuraEnabled(cacheable=true)
    public static List<PicklistWrapper> fetchStates(String CountryName){
        List<PicklistWrapper> piklistList = new  List<PicklistWrapper>();
        try {

            for(State__c con: [select id,Name from State__c where Country__c=:CountryName]){
                PicklistWrapper wrap = new PicklistWrapper();
                wrap.label=con.Name;
                wrap.value=con.Id;
                piklistList.add(wrap);
                
            }
            
        } catch (Exception e) {
            throw new AuraHandledException(e.getMessage());
        }
        return piklistList;
    }
    @AuraEnabled(cacheable=true)
    public static List<PicklistWrapper> fetchCities(String CountryName, String StateName){
        List<PicklistWrapper> piklistList = new  List<PicklistWrapper>();
        try {

            for(City__c con: [select id,Name from City__c where State__c=:StateName and Country__c=:CountryName]){
                PicklistWrapper wrap = new PicklistWrapper();
                wrap.label=con.Name;
                wrap.value=con.Id;
                piklistList.add(wrap);
                
            }
            
        } catch (Exception e) {
            throw new AuraHandledException(e.getMessage());
        }
        return piklistList;
    }

    public class PicklistWrapper{
        @AuraEnabled public String label{get;set;}
        @AuraEnabled public String value{get;set;}
    }


}