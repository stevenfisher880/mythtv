include ( ../../config.mak )
include (../../settings.pro)
include ( ../programs-libs.pro )

TEMPLATE = app
CONFIG += thread
target.path = $${PREFIX}/bin
INSTALLS = target

QMAKE_CLEAN += $(TARGET)

# Input
SOURCES += main.cpp ClassicCommDetector.cpp CommDetectorFactory.cpp CommDetectorBase.cpp
HEADERS += CommDetectorBase.h ClassicCommDetector.h SlotRelayer.h CustomEventRelayer.h CommDetectorFactory.h
