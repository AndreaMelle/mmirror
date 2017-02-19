#include "PIR.h"

#ifndef PIR_FAKE
#include <pigpio.h>
#endif

#include <thread>

using namespace Sensing;

void PIR::Open()
{
  m_pirState = Absence;

#ifndef PIR_FAKE
  int res = gpioInitialise();

  if(res < 0)
  {
    throw std::runtime_error("Failed to open PIR sensor.");
  }

  gpioSetMode(18, PI_INPUT);
#endif
}

void PIR::Close()
{
#ifndef PIR_FAKE
  gpioTerminate();
#endif
}

void PIR::Update()
{
#ifndef PIR_FAKE
  int pirVal = gpioRead(18);

  if(PI_BAD_GPIO != pirVal)
  {
    m_pirState = (pirVal == PI_HIGH) ? Presence : Absence;
  }

  time_sleep(0.1); // seconds

#else
  m_pirState = 1 - m_pirState;
  std::this_thread::sleep_for(std::chrono::milliseconds(5000));
#endif

}
