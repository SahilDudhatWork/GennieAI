#import "AppDelegate.h"
#import <React/RCTBundleURLProvider.h>
#import <Firebase.h>
#import <GoogleSignIn/GoogleSignIn.h>

@implementation AppDelegate

- (BOOL)application:(UIApplication *)application didFinishLaunchingWithOptions:(NSDictionary *)launchOptions
{
  // Configure Firebase
  [FIRApp configure];
  
  // Standard React Native setup
  self.moduleName = @"GennieAI";
  self.initialProps = @{};
  
  return [super application:application didFinishLaunchingWithOptions:launchOptions];
}

- (NSURL *)sourceURLForBridge:(RCTBridge *)bridge
{
  return [self bundleURL];
}

- (NSURL *)bundleURL
{
#if DEBUG
  return [[RCTBundleURLProvider sharedSettings] jsBundleURLForBundleRoot:@"index"];
#else
  return [[NSBundle mainBundle] URLForResource:@"main" withExtension:@"jsbundle"];
#endif
}

// Handle the URL for Google Sign-In callback
- (BOOL)application:(UIApplication *)app openURL:(NSURL *)url options:(NSDictionary<UIApplicationOpenURLOptionsKey,id> *)options
{
  return [GIDSignIn.sharedInstance handleURL:url];
}

@end
