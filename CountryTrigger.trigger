trigger CountryTrigger on Country__c (after update) {
	List<State__c> statesToUpdate = new List<State__c>();
    List<City__c> citiesToUpdate = new List<City__c>();

    // Collecting Country__c records with updated Blacklisted__c field
    Set<Id> countryIds = new Set<Id>();
    for (Country__c country : Trigger.new) {
        Country__c oldCountry = Trigger.oldMap.get(country.Id);
        if (country.Blacklisted__c != oldCountry.Blacklisted__c) {
            countryIds.add(country.Id);
        }
    }

    // Querying related State__c records
    Map<Id, State__c> statesMap = new Map<Id, State__c>([SELECT Id,Country__c, Blacklisted__c FROM State__c WHERE Country__c IN :countryIds]);

    // Updating State__c records
    for (State__c state : statesMap.values()) {
        if (state.Blacklisted__c != Trigger.newMap.get(state.Country__c).Blacklisted__c) {
            state.Blacklisted__c = Trigger.newMap.get(state.Country__c).Blacklisted__c;
            statesToUpdate.add(state);
        }
    }

    // Querying related City__c records
    Map<Id, City__c> citiesMap = new Map<Id, City__c>([SELECT Id, Blacklisted__c,Country__c FROM City__c WHERE State__c IN :statesMap.keySet()]);

    // Updating City__c records
    for (City__c city : citiesMap.values()) {
        if (city.Blacklisted__c != Trigger.newMap.get(city.Country__c).Blacklisted__c) {
            city.Blacklisted__c = Trigger.newMap.get(city.Country__c).Blacklisted__c;
            citiesToUpdate.add(city);
        }
    }

    // Performing DML operations to update records
    if (!statesToUpdate.isEmpty()) {
        update statesToUpdate;
    }
    if (!citiesToUpdate.isEmpty()) {
        update citiesToUpdate;
    }
}