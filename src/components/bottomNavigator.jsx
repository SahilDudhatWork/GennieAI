import React from 'react';
import {View, Text, TouchableOpacity, StyleSheet} from 'react-native';
import {
  ChatIcon,
  HistoryIcon,
  UserIcon,
  WhiteChatIcon,
  WhiteHistoryIcon,
  WhiteUserIcon,
} from './Icons';
import {Colors, FontFamily} from '../../Utils/Themes';
import {useNavigation} from '@react-navigation/native';

const BottomNavigator = ({selectedTab, setSelectedTab}) => {
  const navigation = useNavigation();

  const handleTabPress = tabName => {
    setSelectedTab(tabName);
    navigation.navigate('Main', {screen: tabName});
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.item}
        onPress={() => handleTabPress('Chat')}>
        <View
          style={[
            styles.iconContainer,
            selectedTab === 'Chat' && styles.selectedIconContainer,
          ]}>
          {selectedTab === 'Chat' ? <WhiteChatIcon /> : <ChatIcon />}
        </View>
        <Text
          style={[
            styles.label,
            selectedTab === 'Chat' && styles.selectedLabel,
          ]}>
          Chat
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.item}
        onPress={() => handleTabPress('History')}>
        <View
          style={[
            styles.iconContainer,
            selectedTab === 'History' && styles.selectedIconContainer,
          ]}>
          {selectedTab === 'History' ? <WhiteHistoryIcon /> : <HistoryIcon />}
        </View>
        <Text
          style={[
            styles.label,
            selectedTab === 'History' && styles.selectedLabel,
          ]}>
          History
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.item}
        onPress={() => handleTabPress('Profile')}>
        <View
          style={[
            styles.iconContainer,
            selectedTab === 'Profile' && styles.selectedIconContainer,
          ]}>
          {selectedTab === 'Profile' ? <WhiteUserIcon /> : <UserIcon />}
        </View>
        <Text
          style={[
            styles.label,
            selectedTab === 'Profile' && styles.selectedLabel,
          ]}>
          Profile
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 9,
    backgroundColor: '#fff',
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
    shadowColor: '#0000001A',
    shadowOffset: {
      width: 0,
      height: -9,
    },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 50,
  },
  item: {
    alignItems: 'center',
  },
  iconContainer: {
    backgroundColor: '#C6B0F94A',
    borderRadius: 50,
    width: 35,
    height: 35,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 6,
  },
  selectedIconContainer: {
    backgroundColor: Colors.deepViolet,
  },
  label: {
    fontSize: 10,
    color: Colors.darkBlack,
    fontFamily: FontFamily.SpaceGrotesk,
    fontWeight: '400',
  },
  selectedLabel: {
    fontWeight: '700',
    color: Colors.deepViolet,
  },
});

export default BottomNavigator;
