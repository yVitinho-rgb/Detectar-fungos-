import { StyleSheet, Dimensions } from 'react-native';

const { width, height } = Dimensions.get('window');

export const COR_NEON = "#B8A8FF";
export const COR_PRETO_ABSOLUTO = "#000000";
export const COR_BRANCO = "#FFFFFF";
export const COR_CINZA_CLARO = "#AAA";

export default StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COR_PRETO_ABSOLUTO,
  },
  cameraPlaceholder: {
    ...StyleSheet.absoluteFillObject,
    width: '100%',
    height: '100%',
  },
  overlayContainer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.2)',
  },
  scannerFrame: {
    width: width * 0.7,
    height: width * 0.7,
    borderWidth: 2,
    borderColor: COR_NEON,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: COR_NEON,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 15,
    elevation: 10,
  },
  laserLine: {
    width: '90%',
    height: 2,
    backgroundColor: COR_NEON,
    shadowColor: COR_NEON,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 10,
  },
  statusText: {
    color: COR_BRANCO,
    fontSize: 18,
    fontWeight: '600',
    marginTop: 30,
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: -1, height: 1 },
    textShadowRadius: 10,
  },
  resultCard: {
    position: 'absolute',
    bottom: 120,
    left: 20,
    right: 20,
    backgroundColor: 'rgba(20, 20, 20, 0.85)',
    borderRadius: 25,
    padding: 15,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(184, 168, 255, 0.3)',
  },
  thumbnail: {
    width: 60,
    height: 60,
    borderRadius: 15,
    backgroundColor: COR_BRANCO,
    marginRight: 15,
  },
  infoContainer: {
    flex: 1,
  },
  resultTitle: {
    color: COR_BRANCO,
    fontSize: 18,
    fontWeight: 'bold',
  },
  resultSubtitle: {
    color: COR_NEON,
    fontSize: 14,
    marginTop: 2,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    backgroundColor: COR_PRETO_ABSOLUTO,
    paddingBottom: 20,
  },
  footerIsland: {
    position: 'absolute',
    top: -15,
    alignSelf: 'center',
    backgroundColor: COR_PRETO_ABSOLUTO,
    paddingHorizontal: 25,
    paddingVertical: 5,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    zIndex: 1,
  },
  footerBrand: {
    color: COR_BRANCO,
    textAlign: 'center',
    fontSize: 12,
    fontWeight: 'bold',
  },
  tabBar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingTop: 20,
    paddingHorizontal: 10,
    borderTopWidth: 1,
    borderTopColor: 'rgba(184, 168, 255, 0.2)',
  },
  tabItem: {
    alignItems: 'center',
  },
  tabLabel: {
    fontSize: 10,
    color: COR_CINZA_CLARO,
    marginTop: 4,
  },
  tabLabelActive: {
    color: COR_BRANCO,
  },
  floatingWrapper: {
    position: 'absolute',
    right: 20,
    bottom: 90,
    alignItems: 'center',
  },
  floatingButton: {
    backgroundColor: COR_PRETO_ABSOLUTO,
    width: 56,
    height: 56,
    borderRadius: 28,
    borderWidth: 2,
    borderColor: COR_NEON,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: COR_NEON,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 15,
    elevation: 10,
  },
  glowBeam: {
    position: 'absolute',
    bottom: -15,
    width: 70,
    height: 30,
    backgroundColor: COR_NEON,
    opacity: 0.4,
    borderRadius: 50,
    transform: [{ scaleX: 1.8 }],
    shadowColor: COR_NEON,
    shadowRadius: 20,
    shadowOpacity: 1,
  }
});