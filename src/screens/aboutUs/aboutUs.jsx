import React, {useEffect, useState} from 'react';
import ScreenWrapper from '../../components/ScreenWrapper';
import {
  Dimensions,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import BackButton from '../../components/BackButton';
import {Colors, FontFamily} from '../../../Utils/Themes';
import axios from '../../../axios';
import RenderHtml from 'react-native-render-html';
import i18n from '../../localization/i18n';

function AboutUs({navigation}) {
  const [aboutUsData, setAboutUsData] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const handleBackNext = () => {
    navigation.goBack();
  };
  const fetchData = async () => {
    try {
      axios
        .get('/v1/user/cms/term-and-conditions')
        .then(async res => {
          setAboutUsData(res.data.description);
        })
        .catch(error => {
          console.log(error?.request, 'error?.request');
        });
    } catch (error) {
      console.error('Error retrieving user data:', error);
    }
  };

  return (
    <ScreenWrapper isSpecialBg={true}>
      <View style={[styles.container]} showsVerticalScrollIndicator={false}>
        <TouchableOpacity>
          <BackButton handleBackNext={handleBackNext} />
        </TouchableOpacity>
        <View style={styles.aboutUsContainer}>
          <Text style={styles.aboutUsText}>
            {i18n.t('aboutUsPage.aboutUs')}
          </Text>
        </View>

        <ScrollView
          nestedScrollEnabled={true}
          showsVerticalScrollIndicator={false}>
          {aboutUsData ? (
            <RenderHtml
              contentWidth={Dimensions.get('window').width}
              source={{html: aboutUsData}}
            />
          ) : (
            <Text>{i18n.t('common.loading')}</Text>
          )}
        </ScrollView>
      </View>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  aboutUsContainer: {
    paddingTop: 25,
    display: 'flex',
    alignItems: 'center',
  },
  aboutUsText: {
    fontFamily: FontFamily.SpaceGrotesk,
    color: Colors.deepViolet,
    fontSize: 22,
    fontWeight: '700',
  },
});
export default AboutUs;
