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
    setAboutUsData(
      `<p>Welcome to Your App Name. By using our mobile application, you agree to comply with and be bound by the following Terms and Conditions. If you do not agree with these terms, please do not use the App.</p><p><strong>Acceptance of Terms</strong></p><p>By downloading, installing, and using the App, you agree to these Terms and our Privacy Policy. We reserve the right to update or modify these Terms at any time.</p><p><strong>1. Use of the App</strong></p><ul><li>You must be at least age years old to use the App.</li><li>You agree to use the App for lawful purposes only.</li><li>You are responsible for maintaining the confidentiality of your account credentials.</li></ul><p><strong>2. User Content</strong></p><ul><li>You retain ownership of any content you upload but grant us a license to use, modify, and distribute it as necessary for App functionality.</li><li>You must not upload illegal, harmful, or copyrighted content without permission.</li></ul><p><strong>3. Prohibited Activities</strong></p><ul><li>Engage in fraud, hacking, or other malicious activities.App.</li></ul>`,
    );
    // try {
    //   axios
    //     .get('/v1/user/cms/term-and-conditions')
    //     .then(async res => {
    //       setAboutUsData(res.data.description);
    //     })
    //     .catch(error => {
    //       console.log(error?.request, 'error?.request');
    //     });
    // } catch (error) {
    //   console.error('Error retrieving user data:', error);
    // }
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
