import React, {useState} from 'react';
import {StyleSheet, View, Text} from 'react-native';
import ScreenWrapper from '../../components/ScreenWrapper';
import {Colors, FontFamily} from '../../../Utils/Themes';
import DropDownPicker from 'react-native-dropdown-picker';
import {LanguageIcon} from '../../components/Icons';
import BackButton from '../../components/BackButton';

function SelectLanguage({navigation}) {
  const [open, setOpen] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState('eni');
  const [languages, setLanguages] = useState([
    {label: 'English (India)', value: 'eni'},
    {label: 'English (United Kingdom)', value: 'fr'},
    {label: 'French', value: 'fn'},
    {label: 'French (Canada)', value: 'fnc'},
    {label: 'German', value: 'gr'},
    {label: 'German (Austria)', value: 'gra'},
    {label: 'Hindi', value: 'hn'},
  ]);

  return (
    <ScreenWrapper>
      <View>
        <BackButton />
      </View>
      <View style={{paddingTop: 50}}>
        <Text style={styles.selectLanguageText}>Select your Language</Text>
      </View>
      <View style={{paddingTop: 20}}>
        <DropDownPicker
          open={open}
          value={selectedLanguage}
          items={languages}
          setOpen={setOpen}
          setValue={setSelectedLanguage}
          setItems={setLanguages}
          placeholder="Choose a language..."
          style={styles.dropdown}
          dropDownContainerStyle={styles.dropdownContainer}
          textStyle={{
            fontSize: 16,
            fontWeight: '400',
            color: Colors.white,
            fontFamily: FontFamily.SpaceGrotesk,
          }}
          labelStyle={{
            fontSize: 16,
            fontWeight: '400',
            color: Colors.white,
            fontFamily: FontFamily.SpaceGrotesk,
          }}
        />
      </View>
      <LanguageIcon />
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  button: {
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF59',
    borderRadius: 20,
    backdropFilter: 'blur(4px)',
  },
  selectLanguageText: {
    fontSize: 22,
    fontWeight: '600',
    color: Colors.white,
    fontFamily: FontFamily.SpaceGrotesk,
    textAlign: 'center',
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
  },
  dropdown: {
    marginTop: 5,
    borderWidth: 1,
    borderColor: Colors.white,
    borderRadius: 12,
    backdropFilter: 'blur(4px)',
    backgroundColor: '#FFFFFF59',
  },
  dropdownContainer: {
    marginTop: 20,
    borderWidth: 1,
    borderRadius: 12,
    borderColor: Colors.white,
    backdropFilter: 'blur(4px)',
    backgroundColor: '#FFFFFF59',
  },
});

export default SelectLanguage;
