import React, {useMemo, useState} from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import ScreenWrapper from '../../components/ScreenWrapper';
import {Colors, FontFamily} from '../../../Utils/Themes';
import DropDownPicker from 'react-native-dropdown-picker';
import BackButton from '../../components/BackButton';
import langs from 'langs';
import AsyncStorage from '@react-native-async-storage/async-storage';
// import CountryPicker from 'react-native-country-picker-modal';
import CountryFlag from 'react-native-country-flag';

const Height = Dimensions.get('window').height;

function SelectLanguage({navigation}) {
  const [open, setOpen] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState('en');
  // const [countryCode, setCountryCode] = useState('US');

  const handleNext = async () => {
    const isLanguage = await AsyncStorage.getItem('isLanguage');
    if (!isLanguage) {
      await AsyncStorage.setItem('isLanguage', 'true');
    }
    navigation.replace('TermsConditions');
  };

  // const languageOptions = useMemo(() => {
  //   return langs
  //     .names()
  //     .map(name => {
  //       const lang = langs.where('name', name);
  //       if (!lang) return null;

  //       const languageCode = lang['1'];
  //       return {
  //         label: name,
  //         value: languageCode,
  //       };
  //     })
  //     .filter(Boolean);
  // }, []);

  // const languageOptions = useMemo(() => {
  //   return langs
  //     .names()
  //     .map(name => {
  //       const lang = langs.where('name', name);
  //       if (!lang) return null;

  //       const languageCode = lang['1'];

  //       return {
  //         label: (
  //           <View style={styles.languageItem}>
  //             <CountryFlag
  //               isoCode={languageCode}
  //               size={25}
  //               style={styles.flag}
  //             />
  //             <Text style={styles.languageText}>{name}</Text>
  //           </View>
  //         ),
  //         value: languageCode,
  //       };
  //     })
  //     .filter(Boolean);
  // }, []);

  const languageOptions = useMemo(() => {
    const options = [
      {name: 'English', code: 'en', countryCode: 'US'},
      {name: 'Hindi', code: 'hi', countryCode: 'IN'},
      {name: 'French', code: 'fr', countryCode: 'FR'},
      {name: 'Chinese', code: 'zh', countryCode: 'CN'},
    ];

    return options.map(lang => ({
      label: (
        <View style={styles.languageItem}>
          <CountryFlag
            isoCode={lang.countryCode}
            size={25}
            style={styles.flag}
          />
          <Text style={styles.languageText}>{lang.name}</Text>
        </View>
      ),
      value: lang.code,
    }));
  }, []);

  const handleBackNext = () => {
    navigation.goBack();
  };

  return (
    <ScreenWrapper style={styles.container}>
      <View>
        <BackButton handleBackNext={handleBackNext} />
      </View>
      <View style={{paddingTop: 80}}>
        <Text style={styles.selectLanguageText}>Select your Language</Text>
      </View>
      <View style={{paddingTop: 20}}>
        <DropDownPicker
          open={open}
          value={selectedLanguage}
          items={languageOptions}
          setOpen={setOpen}
          setValue={setSelectedLanguage}
          placeholder="Choose a language..."
          style={styles.dropdown}
          dropDownContainerStyle={styles.dropdownContainer}
          textStyle={styles.dropdownTextStyle}
          labelStyle={styles.dropdownLabelStyle}
          listMode="FLATLIST"
          dropDownDirection="AUTO"
          autoScroll
        />
      </View>

      <TouchableOpacity style={styles.buttonNext} onPress={handleNext}>
        <Text style={styles.buttonNextText}>Next</Text>
      </TouchableOpacity>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  buttonNext: {
    backgroundColor: Colors.deepViolet,
    borderRadius: 22,
    width: '100%',
    marginTop: 30,
    padding: 12,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',
    bottom: 10,
    zIndex: 999,
  },
  languageItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  languageText: {
    fontSize: 16,
    fontWeight: '400',
    color: Colors.darkBlack,
    fontFamily: FontFamily.SpaceGrotesk,
  },
  buttonNextText: {
    color: Colors.white,
    fontSize: 16,
    textAlign: 'center',
    fontWeight: '500',
    fontFamily: FontFamily.SpaceGrotesk,
  },
  selectLanguageText: {
    fontSize: 22,
    fontWeight: '600',
    color: Colors.deepViolet,
    fontFamily: FontFamily.SpaceGroteskBold,
    textAlign: 'center',
  },
  dropdown: {
    marginTop: 5,
    borderWidth: 1,
    borderColor: Colors.darkGray,
    borderRadius: 12,
    backgroundColor: '#FFFFFF59',
  },
  dropdownContainer: {
    marginTop: 20,
    borderWidth: 1,
    borderRadius: 12,
    borderColor: Colors.darkGray,
    backgroundColor: '#FFFFFF59',
    maxHeight: Height - 360,
  },
  dropdownTextStyle: {
    fontSize: 16,
    fontWeight: '400',
    color: Colors.darkBlack,
    fontFamily: FontFamily.SpaceGrotesk,
  },
  dropdownLabelStyle: {
    fontSize: 16,
    fontWeight: '400',
    color: Colors.darkGray,
    fontFamily: FontFamily.SpaceGrotesk,
  },
  flag: {
    marginRight: 10,
    borderRadius: 4,
    width: 26,
    height: 20,
  },
});

export default SelectLanguage;
