#include "Sensor.h"
#include <assert.h>
#include <chrono>
#include <thread>
#include "PIR.h"

using namespace Sensing;

Sensor::~Sensor()
{
  Stop();
}

void Sensor::Start()
{
  if(m_started)
  {
    return;
  }

  m_stop = false;

  uv_rwlock_init(&m_dataLock);

  uv_async_init(
    uv_default_loop(),
    &m_async,
    &Sensor::OnThreadHasData);

  m_async.data = static_cast<void*>(this);

  uv_thread_create(
    &m_thread,
    &Sensor::ThreadEntryFn,
    static_cast<void*>(this));

  m_started = true;
}

void Sensor::Stop()
{
  if(m_started)
  {
    m_stop = true;
    uv_thread_join(&m_thread);
    uv_close((uv_handle_t*)&m_async, NULL);
    uv_rwlock_destroy(&m_dataLock);

  }

  m_started = false;
}

void Sensor::ExecuteSensingLoop()
{
  PIR pir;
  pir.Open();
  SensorState currentPir = pir.GetState();

  while(!m_stop)
  {
    pir.Update();

    SensorState newPir = pir.GetState();

    if(newPir != currentPir)
    {
      currentPir = newPir;
      uv_rwlock_wrlock(&m_dataLock);
      m_sharedData = currentPir;
      uv_rwlock_wrunlock(&m_dataLock);
      uv_async_send(&m_async);
    }

  }

  pir.Close();

}

// Data ready - called on main thread
void Sensor::HandleData()
{
  SensorState state;

  {
    uv_rwlock_rdlock(&m_dataLock);
    state = m_sharedData; // copy
    uv_rwlock_rdunlock(&m_dataLock);
  }

  for(auto const& listener : m_listeners)
  {
    listener->OnStateChange(state);
  }
}

void Sensor::AddListener(ISensorListener* listener, SensorDescr descr)
{
  if(m_listeners.find(listener) == m_listeners.end())
  {
      m_listeners.insert(listener);
  }
}

void Sensor::RemoveListener(ISensorListener* listener)
{
  if(m_listeners.find(listener) != m_listeners.end())
  {
    m_listeners.erase(listener);
  }
}

void Sensor::ThreadEntryFn(void* arg)
{
  // We could also use GetInstance() here
  Sensor* sensor = static_cast<Sensor*>(arg);
  assert(sensor != nullptr);
  sensor->ExecuteSensingLoop();
}

void Sensor::OnThreadHasData(uv_async_t* handle)
{
  // We could also use GetInstance() here
  Sensor* sensor = static_cast<Sensor*>(handle->data);
  assert(sensor != nullptr);
  sensor->HandleData();
}
